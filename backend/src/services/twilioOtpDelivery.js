/**
 * Custom OTP + Twilio Programmable Messaging (WhatsApp first, SMS fallback).
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN.
 * WhatsApp: TWILIO_WHATSAPP_FROM e.g. whatsapp:+14155238886 (sandbox) or approved sender.
 * SMS: TWILIO_SMS_FROM E.164
 */

function getClient() {
  if (process.env.OTP_SIMULATE === 'true' || process.env.OTP_SIMULATE === '1') {
    return null;
  }
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    return null;
  }
  // eslint-disable-next-line global-require
  return require('twilio')(sid, token);
}

function buildBody(code) {
  const brand = process.env.OTP_MESSAGE_BRAND || 'HealthyWAI';
  return `Your ${brand} verification code is: ${code}. It expires in 10 minutes.`;
}

/**
 * @returns {Promise<{ channel: 'whatsapp' | 'sms' | 'simulated', detail?: string }>}
 */
async function deliverOtp(phoneE164, code, options = {}) {
  const { preferSms = false } = options;
  const body = buildBody(code);

  if (process.env.OTP_SIMULATE === 'true' || process.env.OTP_SIMULATE === '1') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[OTP_SIMULATE] code for', phoneE164, '=>', code);
    }
    return { channel: 'simulated' };
  }

  const client = getClient();
  if (!client) {
    const err = new Error(
      'SMS is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN, or OTP_SIMULATE=true for development.'
    );
    err.statusCode = 503;
    throw err;
  }

  const smsFrom = process.env.TWILIO_SMS_FROM;
  const waFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (preferSms) {
    if (!smsFrom) {
      const err = new Error('TWILIO_SMS_FROM is not set.');
      err.statusCode = 503;
      throw err;
    }
    await client.messages.create({ to: phoneE164, from: smsFrom, body });
    return { channel: 'sms' };
  }

  const waTo = phoneE164.startsWith('whatsapp:')
    ? phoneE164
    : `whatsapp:${phoneE164}`;

  try {
    await client.messages.create({
      to: waTo,
      from: waFrom.startsWith('whatsapp:') ? waFrom : `whatsapp:${waFrom}`,
      body
    });
    return { channel: 'whatsapp' };
  } catch (waErr) {
    console.warn('[Twilio] WhatsApp send failed, falling back to SMS:', waErr.message);
    if (!smsFrom) {
      const err = new Error(
        'Could not send WhatsApp and SMS fallback is not configured (TWILIO_SMS_FROM).'
      );
      err.statusCode = 502;
      err.cause = waErr;
      throw err;
    }
    await client.messages.create({ to: phoneE164, from: smsFrom, body });
    return { channel: 'sms', detail: 'whatsapp_unavailable' };
  }
}

module.exports = {
  deliverOtp
};
