import {
  deriveRowState,
  ROW_STATE_NO_CHANNEL,
  ROW_STATE_IDLE,
  ROW_STATE_UNAVAILABLE_DATES,
  ROW_STATE_MIN_STAY_VIOLATION,
  ROW_STATE_SIGN_IN_GATED,
  ROW_STATE_DIRECT_GATED,
  ROW_STATE_REVEALED_DIRECT,
  ROW_STATE_LIMIT_GATED,
  ROW_STATE_STALE,
  ROW_STATE_LOADING,
  ROW_STATE_TIMEOUT,
  ROW_STATE_ERROR,
  ROW_STATE_CALENDAR_CONTRADICTION,
  ROW_STATE_TOP_DEAL,
  ROW_STATE_PRICED_HIGHER,
} from './useBookingRowStates';

const DATES = { checkIn: '2026-06-01', checkOut: '2026-06-03' };

// Fully-open OTA channel over the requested range, 1-night minimum.
const ota = (overrides = {}) => ({
  providerType: 'airhive',
  calendarWindow: { from: '2026-06-01', to: '2026-06-08' },
  blockedRanges: [],
  rates: [{ from: '2026-06-01', to: '2026-06-08', nightly: 200, minStay: 1 }],
  bookDirect: false,
  ...overrides,
});

// A settled quote whose airhive deal is priced; a second channel makes airhive
// either the best deal or not.
const quoteWith = (deal, extra = {}) => ({
  id: 1,
  state: 'finished',
  deals: [{ provider: 'airhive', finished: true, ...deal }],
  topDeal: { provider: 'airhive', total: 300 },
  ...extra,
});

const ctx = (overrides = {}) => ({
  dates: DATES,
  quote: null,
  requestedFor: DATES,
  user: { id: 7 },
  capReached: false,
  revealed: [],
  ...overrides,
});

describe('deriveRowState', () => {
  it('NO_CHANNEL when the channel is absent', () => {
    expect(deriveRowState(null, ctx())).toBe(ROW_STATE_NO_CHANNEL);
  });

  it('UNAVAILABLE_DATES when a night in the range is blocked', () => {
    const channel = ota({ blockedRanges: [{ from: '2026-06-02', to: '2026-06-03' }] });
    expect(deriveRowState(channel, ctx())).toBe(ROW_STATE_UNAVAILABLE_DATES);
  });

  it('MIN_STAY_VIOLATION when the range is shorter than the minimum stay', () => {
    const channel = ota({
      rates: [{ from: '2026-06-01', to: '2026-06-08', nightly: 200, minStay: 5 }],
    });
    expect(deriveRowState(channel, ctx())).toBe(ROW_STATE_MIN_STAY_VIOLATION);
  });

  it('SIGN_IN_GATED for a book-direct channel when logged out', () => {
    const channel = ota({ bookDirect: true });
    expect(deriveRowState(channel, ctx({ user: null }))).toBe(ROW_STATE_SIGN_IN_GATED);
  });

  it('DIRECT_GATED for a signed-in guest who has not revealed the direct link yet', () => {
    const channel = ota({ bookDirect: true });
    expect(deriveRowState(channel, ctx({ user: { id: 7 }, revealed: [] }))).toBe(
      ROW_STATE_DIRECT_GATED,
    );
  });

  it('REVEALED_DIRECT once a book-direct channel has been revealed', () => {
    const channel = ota({ bookDirect: true });
    expect(deriveRowState(channel, ctx({ revealed: ['airhive'] }))).toBe(ROW_STATE_REVEALED_DIRECT);
  });

  it('LIMIT_GATED when the anon quote limit is reached', () => {
    expect(deriveRowState(ota(), ctx({ capReached: true }))).toBe(ROW_STATE_LIMIT_GATED);
  });

  it('IDLE with valid dates but no quote yet', () => {
    expect(deriveRowState(ota(), ctx())).toBe(ROW_STATE_IDLE);
  });

  it('STALE when the quote was requested for different dates', () => {
    const quote = quoteWith({ status: 'priced', total: 300 });
    expect(
      deriveRowState(
        ota(),
        ctx({ quote, requestedFor: { checkIn: '2026-07-01', checkOut: '2026-07-03' } }),
      ),
    ).toBe(ROW_STATE_STALE);
  });

  it('LOADING while the channel deal has not finished', () => {
    const quote = quoteWith({ finished: false });
    expect(deriveRowState(ota(), ctx({ quote }))).toBe(ROW_STATE_LOADING);
  });

  it('LOADING when there is no deal for this channel yet', () => {
    const quote = { id: 1, state: 'processing', deals: [], topDeal: null };
    expect(deriveRowState(ota(), ctx({ quote }))).toBe(ROW_STATE_LOADING);
  });

  it('TIMEOUT when the deal errored with a timeout', () => {
    const quote = quoteWith({ error: 'Timeout' });
    expect(deriveRowState(ota(), ctx({ quote }))).toBe(ROW_STATE_TIMEOUT);
  });

  it('ERROR for a non-timeout deal error', () => {
    const quote = quoteWith({ error: 'ProviderError' });
    expect(deriveRowState(ota(), ctx({ quote }))).toBe(ROW_STATE_ERROR);
  });

  it('CALENDAR_CONTRADICTION when the provider priced a stay our calendar blocks', () => {
    const quote = quoteWith({ status: 'priced', total: 300, contradiction: true });
    expect(deriveRowState(ota(), ctx({ quote }))).toBe(ROW_STATE_CALENDAR_CONTRADICTION);
  });

  it('TOP_DEAL when this channel is the cheapest priced deal', () => {
    const quote = quoteWith({ status: 'priced', total: 300 });
    expect(deriveRowState(ota(), ctx({ quote }))).toBe(ROW_STATE_TOP_DEAL);
  });

  it('PRICED_HIGHER when priced but not the best deal', () => {
    const quote = quoteWith(
      { status: 'priced', total: 400 },
      { topDeal: { provider: 'vacario', total: 300 } },
    );
    expect(deriveRowState(ota(), ctx({ quote }))).toBe(ROW_STATE_PRICED_HIGHER);
  });

  it('UNAVAILABLE_DATES when the settled deal itself is unavailable', () => {
    const quote = quoteWith({ status: 'unavailable' });
    // dates that pass the offline check so we reach the deal-level branch
    expect(deriveRowState(ota(), ctx({ quote }))).toBe(ROW_STATE_UNAVAILABLE_DATES);
  });
});
