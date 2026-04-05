const crypto = require('crypto');

function getSecret() {
  return (
    process.env.OTP_HMAC_SECRET ||
    process.env.JWT_SECRET ||
    'dev-only-otp-secret-change-in-production'
  );
}

function hashOtpCode(phoneE164, code) {
  const normalized = String(code).trim();
  return crypto
    .createHmac('sha256', getSecret())
    .update(`${phoneE164}:${normalized}`)
    .digest('hex');
}

function verifyOtpCode(phoneE164, code, storedHash) {
  if (!storedHash || !code) return false;
  const candidate = hashOtpCode(phoneE164, code);
  try {
    return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

function generateSixDigitCode() {
  return String(crypto.randomInt(100000, 1000000));
}

module.exports = {
  hashOtpCode,
  verifyOtpCode,
  generateSixDigitCode
};
