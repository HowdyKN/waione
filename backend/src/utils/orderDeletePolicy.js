/**
 * Users may cancel an order on or before (delivery date minus N calendar days), inclusive.
 * N is configured with ORDER_DELETE_CUTOFF_DAYS_BEFORE_DELIVERY (default 3).
 */

function getOrderDeleteCutoffDays() {
  const raw = process.env.ORDER_DELETE_CUTOFF_DAYS_BEFORE_DELIVERY;
  const n = raw !== undefined && raw !== '' ? parseInt(raw, 10) : 3;
  if (Number.isNaN(n) || n < 0) return 3;
  return n;
}

function parseDateOnlyUtc(value) {
  if (value == null) return null;
  const s = typeof value === 'string' ? value.trim().slice(0, 10) : '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  return new Date(Date.UTC(y, mo, d));
}

function utcToday() {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

function addDaysUtc(date, days) {
  const x = new Date(date.getTime());
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function formatYmdUtc(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Last calendar day (UTC) cancellation is still allowed (inclusive).
 */
function getCancellationDeadlineUtc(deliveryDate, cutoffDays) {
  const delivery = parseDateOnlyUtc(deliveryDate);
  if (!delivery) return null;
  return addDaysUtc(delivery, -cutoffDays);
}

function evaluateOrderCancellation(order, cutoffDays) {
  const { status } = order;
  if (status === 'delivered' || status === 'cancelled') {
    return {
      allowed: false,
      reason: 'This order cannot be cancelled.'
    };
  }

  const delivery = parseDateOnlyUtc(order.deliveryDate);
  if (!delivery || Number.isNaN(delivery.getTime())) {
    return { allowed: false, reason: 'Invalid delivery date.' };
  }

  const cutoff = getCancellationDeadlineUtc(order.deliveryDate, cutoffDays);
  if (!cutoff) {
    return { allowed: false, reason: 'Invalid delivery date.' };
  }

  const today = utcToday();
  if (today.getTime() > cutoff.getTime()) {
    return {
      allowed: false,
      reason: `Cancellations are only allowed on or before ${formatYmdUtc(
        cutoff
      )} (${cutoffDays} day(s) before delivery).`
    };
  }

  return { allowed: true };
}

function decorateOrderForClient(orderPlain, cutoffDays) {
  const o =
    orderPlain && typeof orderPlain.get === 'function'
      ? orderPlain.get({ plain: true })
      : { ...orderPlain };

  const evalResult = evaluateOrderCancellation(o, cutoffDays);
  const deadline = getCancellationDeadlineUtc(o.deliveryDate, cutoffDays);

  return {
    ...o,
    canDelete: evalResult.allowed,
    cancellationBlockedReason: evalResult.allowed ? null : evalResult.reason,
    cancellationDeadline: deadline ? formatYmdUtc(deadline) : null
  };
}

module.exports = {
  getOrderDeleteCutoffDays,
  evaluateOrderCancellation,
  decorateOrderForClient,
  getCancellationDeadlineUtc
};
