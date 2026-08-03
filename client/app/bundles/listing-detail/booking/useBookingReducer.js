// Reducer for the booking widget (T5.2): dates + guests + the quote lifecycle
// (idle -> creating -> streaming -> settled), streamed per-channel results, reveal
// and limit state. Pure — the hook wires it to the API/ActionCable.

export const SET_DATES = 'booking/SET_DATES';
export const SET_GUESTS = 'booking/SET_GUESTS';
export const QUOTE_REQUESTED = 'booking/QUOTE_REQUESTED';
export const QUOTE_CREATED = 'booking/QUOTE_CREATED';
export const CHANNEL_UPDATE = 'booking/CHANNEL_UPDATE';
export const QUOTE_UPDATED = 'booking/QUOTE_UPDATED';
export const QUOTE_FAILED = 'booking/QUOTE_FAILED';
export const CHANNEL_TIMEOUT = 'booking/CHANNEL_TIMEOUT';
export const REVEAL_DIRECT = 'booking/REVEAL_DIRECT';
export const CAP_REACHED = 'booking/CAP_REACHED';

export const setDates = (dates) => ({ type: SET_DATES, dates });
export const setGuests = (guests) => ({ type: SET_GUESTS, guests });
export const quoteRequested = () => ({ type: QUOTE_REQUESTED });
export const quoteCreated = (quote) => ({ type: QUOTE_CREATED, quote });
export const channelUpdate = (update) => ({ type: CHANNEL_UPDATE, update });
export const quoteUpdated = (quote) => ({ type: QUOTE_UPDATED, quote });
export const quoteFailed = (error) => ({ type: QUOTE_FAILED, error });
export const channelTimeout = (provider) => ({ type: CHANNEL_TIMEOUT, provider });
export const revealDirect = (provider) => ({ type: REVEAL_DIRECT, provider });
export const capReached = () => ({ type: CAP_REACHED });

export function initialBookingState(overrides = {}) {
  return {
    dates: { checkIn: null, checkOut: null },
    guests: { adults: 1, children: 0, infants: 0, pets: false },
    quote: null,
    requestedFor: null,
    status: 'idle',
    revealed: [],
    capReached: false,
    error: null,
    ...overrides,
  };
}

// Recompute the cheapest priced channel (mirrors the server, so streaming and
// poll agree).
function withTopDeal(quote) {
  const priced = (quote.deals || []).filter(
    (deal) => deal.status === 'priced' && deal.total != null,
  );
  if (priced.length === 0) return { ...quote, topDeal: null };
  const cheapest = priced.reduce((best, deal) => (deal.total < best.total ? deal : best));
  return { ...quote, topDeal: { provider: cheapest.provider, total: cheapest.total } };
}

function applyChannelUpdate(quote, update) {
  const deals = (quote.deals || []).map((deal) =>
    deal.provider === update.provider
      ? {
          ...deal,
          finished: true,
          status: update.status ?? deal.status,
          total: update.total ?? deal.total,
          liveTotal: update.liveTotal ?? deal.liveTotal,
          contradiction: update.contradiction ?? deal.contradiction,
          error: update.status === 'error' ? update.error || 'ProviderError' : deal.error,
        }
      : deal,
  );
  const settled = deals.every((deal) => deal.finished);
  return withTopDeal({ ...quote, deals, state: settled ? 'finished' : 'processing' });
}

export function bookingReducer(state, action) {
  switch (action.type) {
    case SET_DATES:
      return { ...state, dates: { ...state.dates, ...action.dates } };
    case SET_GUESTS:
      return { ...state, guests: { ...state.guests, ...action.guests } };
    case QUOTE_REQUESTED:
      return { ...state, status: 'creating', requestedFor: { ...state.dates }, error: null };
    case QUOTE_CREATED:
      return { ...state, status: 'streaming', quote: withTopDeal(action.quote) };
    case CHANNEL_UPDATE: {
      if (!state.quote) return state;
      const quote = applyChannelUpdate(state.quote, action.update);
      return { ...state, quote, status: quote.state === 'finished' ? 'settled' : 'streaming' };
    }
    case QUOTE_UPDATED:
      // The polled payload is authoritative (server-computed topDeal + savings);
      // unlike streaming, we don't recompute and lose the savings breakdown.
      return {
        ...state,
        quote: action.quote,
        status: action.quote.state === 'finished' ? 'settled' : 'streaming',
      };
    case CHANNEL_TIMEOUT: {
      if (!state.quote) return state;
      return {
        ...state,
        quote: applyChannelUpdate(state.quote, {
          provider: action.provider,
          status: 'error',
          error: 'Timeout',
        }),
      };
    }
    case QUOTE_FAILED:
      return { ...state, status: 'error', error: action.error };
    case REVEAL_DIRECT:
      return state.revealed.includes(action.provider)
        ? state
        : { ...state, revealed: [...state.revealed, action.provider] };
    case CAP_REACHED:
      return { ...state, capReached: true, status: 'idle' };
    default:
      return state;
  }
}
