const { parsePhoneNumberFromString } = require('libphonenumber-js');

/**
 * @param {string} raw
 * @param {string} [defaultCountry] ISO 3166-1 alpha-2, default US
 * @returns {{ ok: true, e164: string } | { ok: false, message: string }}
 */
function normalizeToE164(raw, defaultCountry = 'US') {
  if (raw == null || typeof raw !== 'string') {
    return { ok: false, message: 'Phone number is required' };
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: 'Phone number is required' };
  }
  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    return { ok: false, message: 'Please enter a valid phone number' };
  }
  return { ok: true, e164: parsed.format('E.164') };
}

module.exports = { normalizeToE164 };
