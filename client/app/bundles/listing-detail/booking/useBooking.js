import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  bookingReducer,
  initialBookingState,
  quoteRequested,
  quoteCreated,
  quoteUpdated,
  quoteFailed,
  channelUpdate,
  channelTimeout,
  revealDirect,
  setDates as setDatesAction,
  setGuests as setGuestsAction,
  capReached,
} from './useBookingReducer';
import { deriveRowState } from './useBookingRowStates';
import {
  createQuote as defaultCreateQuote,
  fetchQuote as defaultFetchQuote,
  QuoteLimitError,
} from '../api/quoteRequest';
import defaultSubscribeToQuote from './quotesChannel';

const POLL_MS = 2_000;
const MAX_POLLS = 20; // ~40s hard stop, then surface unfinished channels as timeouts

function quoteParams({ dates, guests }) {
  return {
    check_in: dates.checkIn,
    check_out: dates.checkOut,
    adults: guests.adults,
    children: guests.children,
    infants: guests.infants,
    pets: guests.pets,
  };
}

// The booking widget's state machine: owns dates/guests, kicks off the
// async quote, consumes streamed per-channel results over ActionCable with a poll
// fallback, and derives every channel's row state. Dependencies are injectable so
// the flow is testable without a socket or network.
export default function useBooking({
  listingId,
  channels = [],
  user = null,
  initialDates = null,
  deps = {},
}) {
  const [state, dispatch] = useReducer(bookingReducer, initialDates, (dates) =>
    initialBookingState(dates ? { dates } : {}),
  );

  const depsRef = useRef(null);
  depsRef.current = {
    createQuote: deps.createQuote ?? defaultCreateQuote,
    fetchQuote: deps.fetchQuote ?? defaultFetchQuote,
    subscribeToQuote: deps.subscribeToQuote ?? defaultSubscribeToQuote,
  };

  const stateRef = useRef(state);
  stateRef.current = state;

  const liveRef = useRef({ unsubscribe: null, intervalId: null, polls: 0 });

  const teardown = useCallback(() => {
    const live = liveRef.current;
    if (live.unsubscribe) live.unsubscribe();
    if (live.intervalId) clearInterval(live.intervalId);
    liveRef.current = { unsubscribe: null, intervalId: null, polls: 0 };
  }, []);

  const startPolling = useCallback(
    (quoteId) => {
      liveRef.current.intervalId = setInterval(async () => {
        const live = liveRef.current;
        live.polls += 1;
        try {
          const quote = await depsRef.current.fetchQuote(quoteId);
          dispatch(quoteUpdated(quote));
          if (quote.state === 'finished') {
            teardown();
            return;
          }
        } catch {
          // transient — the socket may still deliver; keep polling until the cap
        }
        if (live.polls >= MAX_POLLS) {
          (stateRef.current.quote?.deals || [])
            .filter((deal) => !deal.finished)
            .forEach((deal) => dispatch(channelTimeout(deal.provider)));
          teardown();
        }
      }, POLL_MS);
    },
    [teardown],
  );

  const requestQuote = useCallback(async () => {
    teardown();
    dispatch(quoteRequested());
    try {
      const quote = await depsRef.current.createQuote(listingId, quoteParams(stateRef.current));
      dispatch(quoteCreated(quote));
      if (quote.state === 'finished') return;
      liveRef.current.unsubscribe = depsRef.current.subscribeToQuote(quote.id, {
        onUpdate: (data) => dispatch(channelUpdate(data)),
      });
      startPolling(quote.id);
    } catch (error) {
      if (error instanceof QuoteLimitError) dispatch(capReached());
      else dispatch(quoteFailed(error.message));
    }
  }, [listingId, teardown, startPolling]);

  useEffect(() => teardown, [teardown]);

  const setDates = useCallback((dates) => dispatch(setDatesAction(dates)), []);
  const setGuests = useCallback((guests) => dispatch(setGuestsAction(guests)), []);
  const reveal = useCallback((provider) => dispatch(revealDirect(provider)), []);

  const rowState = useCallback(
    (channel) =>
      deriveRowState(channel, {
        dates: state.dates,
        quote: state.quote,
        requestedFor: state.requestedFor,
        user,
        capReached: state.capReached,
        revealed: state.revealed,
      }),
    [state.dates, state.quote, state.requestedFor, state.capReached, state.revealed, user],
  );

  const rows = useMemo(
    () => channels.map((channel) => ({ channel, state: rowState(channel) })),
    [channels, rowState],
  );

  return {
    dates: state.dates,
    guests: state.guests,
    status: state.status,
    quote: state.quote,
    error: state.error,
    capReached: state.capReached,
    revealed: state.revealed,
    setDates,
    setGuests,
    requestQuote,
    reveal,
    rowState,
    rows,
  };
}
