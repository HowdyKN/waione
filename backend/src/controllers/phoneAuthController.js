const { validationResult } = require('express-validator');
const { User, Session, PhoneOtpChallenge } = require('../models');
const { normalizeToE164 } = require('../services/phoneNormalize');
const {
  hashOtpCode,
  verifyOtpCode,
  generateSixDigitCode
} = require('../utils/phoneOtpCrypto');
const { deliverOtp } = require('../services/twilioOtpDelivery');
const { generateTokens } = require('../utils/jwt');

/**
 * Auto-provision: first successful phone OTP creates a user with a synthetic email if none exists.
 * Existing users are matched by normalized E.164 on users.phone.
 */
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

const requestPhoneOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, preferSms } = req.body;
    const preferSmsFlag =
      preferSms === true ||
      preferSms === 'true' ||
      preferSms === 1 ||
      preferSms === '1';
    const norm = normalizeToE164(phone);
    if (!norm.ok) {
      return res.status(400).json({ success: false, message: norm.message });
    }
    const e164 = norm.e164;
    const code = generateSixDigitCode();
    const codeHash = hashOtpCode(e164, code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await PhoneOtpChallenge.destroy({ where: { phoneE164: e164 } });
    await PhoneOtpChallenge.create({
      phoneE164: e164,
      codeHash,
      expiresAt,
      attempts: 0
    });

    try {
      const result = await deliverOtp(e164, code, { preferSms: preferSmsFlag });
      return res.json({
        success: true,
        data: {
          channel: result.channel,
          ...(result.detail ? { detail: result.detail } : {})
        }
      });
    } catch (e) {
      await PhoneOtpChallenge.destroy({ where: { phoneE164: e164 } });
      const status = e.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: e.message || 'Could not send verification code'
      });
    }
  } catch (error) {
    console.error('requestPhoneOtp:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not start phone verification.'
    });
  }
};

const verifyPhoneOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, code } = req.body;
    const norm = normalizeToE164(phone);
    if (!norm.ok) {
      return res.status(400).json({ success: false, message: norm.message });
    }
    const e164 = norm.e164;

    const challenge = await PhoneOtpChallenge.findOne({
      where: { phoneE164: e164 }
    });
    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: 'No code found. Request a new one.'
      });
    }
    if (challenge.attempts >= MAX_VERIFY_ATTEMPTS) {
      await challenge.destroy();
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Request a new code.'
      });
    }
    if (new Date() > challenge.expiresAt) {
      await challenge.destroy();
      return res.status(400).json({
        success: false,
        message: 'Code expired. Request a new one.'
      });
    }

    if (!verifyOtpCode(e164, code, challenge.codeHash)) {
      await challenge.increment('attempts');
      return res.status(401).json({
        success: false,
        message: 'Invalid code.'
      });
    }

    await challenge.destroy();

    let user = await User.findOne({ where: { phone: e164 } });
    if (!user) {
      const digits = e164.replace(/\D/g, '');
      const syntheticEmail = `${digits}@phone.waione.local`;
      const existing = await User.findOne({
        where: { email: syntheticEmail }
      });
      if (existing) {
        user = existing;
        if (!user.phone) {
          await user.update({ phone: e164 });
        }
      } else {
        user = await User.create({
          email: syntheticEmail,
          password: null,
          firstName: 'Member',
          lastName: 'User',
          phone: e164,
          isEmailVerified: false
        });
      }
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    await user.update({ lastLoginAt: new Date() });

    const { accessToken, refreshToken } = generateTokens(user);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Session.create({
      userId: user.id,
      token: accessToken,
      refreshToken,
      deviceInfo: req.body.deviceInfo || null,
      ipAddress: req.ip || req.connection?.remoteAddress,
      expiresAt
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestPhoneOtp,
  verifyPhoneOtp
};
