/** How many upcoming Saturday options to offer (e.g. next Sat, +1 week, +2 weeks). */
export const UPCOMING_SATURDAY_SLOT_COUNT = 3;

/**
 * Next Saturday from today. If today is Saturday, uses the following Saturday (matches legacy Home behavior).
 */
export function getNextSaturdayDate() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysUntilSaturday,
    12,
    0,
    0,
    0
  );
}

export function toLocalDateOnly(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getNextSaturdayDateOnly() {
  return toLocalDateOnly(getNextSaturdayDate());
}

/**
 * Upcoming delivery Saturdays: first is next Saturday, then +7 days each.
 * @param {number} count how many options (default 3)
 */
export function getUpcomingSaturdayOptions(count = UPCOMING_SATURDAY_SLOT_COUNT) {
  const first = getNextSaturdayDate();
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(
      first.getFullYear(),
      first.getMonth(),
      first.getDate() + i * 7,
      12,
      0,
      0,
      0
    );
    out.push({ date: d, iso: toLocalDateOnly(d) });
  }
  return out;
}

export function formatDeliveryLabel(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(isoDate);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Accept only YYYY-MM-DD that is a Saturday in local time.
 */
export function parseSaturdayDeliveryParam(iso) {
  if (iso == null) return null;
  const s = typeof iso === 'string' ? iso : String(iso);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const day = parseInt(m[3], 10);
  const d = new Date(y, mo, day, 12, 0, 0, 0);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;
  if (d.getDay() !== 6) return null;
  return s.trim();
}

/**
 * Normalize route/search param (may be encoded) to YYYY-MM-DD for API payloads.
 */
export function normalizeDeliveryDateParam(raw) {
  if (raw == null) return null;
  let s = Array.isArray(raw) ? raw[0] : raw;
  s = typeof s === 'string' ? s : String(s);
  try {
    s = decodeURIComponent(s.trim());
  } catch {
    s = s.trim();
  }
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return m ? m[1] : null;
}

/** Safe value to send as deliveryDate on create order (never a Date object). */
export function toDeliveryDatePayload(iso) {
  if (iso == null || typeof iso !== 'string') return '';
  return iso.trim().slice(0, 10);
}

/**
 * Recover YYYY-MM-DD from Expo Router useSegments() when /order/confirm/:date is used.
 */
export function deliveryDateFromSegments(segments) {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  const confirmIdx = segments.lastIndexOf('confirm');
  if (confirmIdx >= 0 && segments[confirmIdx + 1]) {
    const n = normalizeDeliveryDateParam(segments[confirmIdx + 1]);
    if (n) return n;
  }
  for (let i = segments.length - 1; i >= 0; i--) {
    const n = normalizeDeliveryDateParam(segments[i]);
    if (n) return n;
  }
  return null;
}
