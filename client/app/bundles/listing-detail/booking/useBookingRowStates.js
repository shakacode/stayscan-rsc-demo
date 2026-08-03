import { evaluateRange } from './useBookingAvailability';

// The per-channel booking-row states. Each is visually distinct in the
// price-comparison table; the reducer/derivation below is the single source of truth.
export const ROW_STATE_NO_CHANNEL = 'no-channel';
export const ROW_STATE_IDLE = 'idle';
export const ROW_STATE_UNAVAILABLE_DATES = 'unavailable-dates';
export const ROW_STATE_MIN_STAY_VIOLATION = 'min-stay-violation';
export const ROW_STATE_SIGN_IN_GATED = 'sign-in-gated';
export const ROW_STATE_DIRECT_GATED = 'direct-gated';
export const ROW_STATE_REVEALED_DIRECT = 'revealed-direct';
export const ROW_STATE_LIMIT_GATED = 'limit-gated';
export const ROW_STATE_STALE = 'stale';
export const ROW_STATE_LOADING = 'loading';
export const ROW_STATE_TIMEOUT = 'timeout';
export const ROW_STATE_ERROR = 'error';
export const ROW_STATE_CALENDAR_CONTRADICTION = 'calendar-contradiction';
export const ROW_STATE_TOP_DEAL = 'top-deal';
export const ROW_STATE_PRICED_HIGHER = 'priced-higher';
export const ROW_STATE_PRICED = 'priced';

const TIMEOUT_ERRORS = new Set(['Timeout', 'TimeoutError']);
const datesMatch = (a, b) => !!a && !!b && a.checkIn === b.checkIn && a.checkOut === b.checkOut;

// Pure: derive one channel's row state from the current booking context.
export function deriveRowState(channel, ctx) {
  if (!channel) return ROW_STATE_NO_CHANNEL;

  const { dates, quote, requestedFor, user, capReached, revealed = [] } = ctx;
  const haveDates = !!(dates.checkIn && dates.checkOut);

  // Offline date-eligibility (from the shipped bitstrings) takes precedence.
  if (haveDates) {
    const range = evaluateRange(channel, dates);
    if (!range.available) return ROW_STATE_UNAVAILABLE_DATES;
    if (!range.minStayOk) return ROW_STATE_MIN_STAY_VIOLATION;
  }

  // Book-direct reveal gating: the direct link is hidden until revealed —
  // anonymous guests must sign in first, signed-in guests just confirm.
  if (channel.bookDirect) {
    if (revealed.includes(channel.providerType)) return ROW_STATE_REVEALED_DIRECT;
    return user ? ROW_STATE_DIRECT_GATED : ROW_STATE_SIGN_IN_GATED;
  }

  if (capReached) return ROW_STATE_LIMIT_GATED;
  if (!quote) return ROW_STATE_IDLE;
  if (!datesMatch(requestedFor, dates)) return ROW_STATE_STALE;

  const deal = (quote.deals || []).find((entry) => entry.provider === channel.providerType);
  if (!deal || !deal.finished) return ROW_STATE_LOADING;
  if (deal.error) return TIMEOUT_ERRORS.has(deal.error) ? ROW_STATE_TIMEOUT : ROW_STATE_ERROR;
  if (deal.contradiction) return ROW_STATE_CALENDAR_CONTRADICTION;
  if (deal.status === 'unavailable') return ROW_STATE_UNAVAILABLE_DATES;
  if (deal.status === 'priced') {
    return quote.topDeal && quote.topDeal.provider === channel.providerType
      ? ROW_STATE_TOP_DEAL
      : ROW_STATE_PRICED_HIGHER;
  }
  return ROW_STATE_PRICED;
}
