import {
  bookingReducer,
  initialBookingState,
  setDates,
  setGuests,
  quoteRequested,
  quoteCreated,
  channelUpdate,
  quoteUpdated,
  quoteFailed,
  channelTimeout,
  revealDirect,
  capReached,
} from './useBookingReducer';

const DATES = { checkIn: '2026-06-01', checkOut: '2026-06-03' };

const pendingQuote = () => ({
  id: 9,
  state: 'processing',
  deals: [
    { provider: 'airhive', finished: false },
    { provider: 'vacario', finished: false },
  ],
  topDeal: null,
});

describe('bookingReducer', () => {
  it('starts idle with one adult and no quote', () => {
    const state = initialBookingState();
    expect(state.status).toBe('idle');
    expect(state.guests.adults).toBe(1);
    expect(state.quote).toBeNull();
  });

  it('merges date and guest edits without dropping the rest', () => {
    let state = initialBookingState();
    state = bookingReducer(state, setDates({ checkIn: '2026-06-01' }));
    state = bookingReducer(state, setDates({ checkOut: '2026-06-03' }));
    state = bookingReducer(state, setGuests({ adults: 3 }));
    expect(state.dates).toEqual(DATES);
    expect(state.guests).toEqual({ adults: 3, children: 0, infants: 0, pets: false });
  });

  it('records requestedFor when a quote is requested', () => {
    let state = bookingReducer(initialBookingState({ dates: DATES }), quoteRequested());
    expect(state.status).toBe('creating');
    expect(state.requestedFor).toEqual(DATES);
  });

  it('goes streaming once the quote is created', () => {
    const state = bookingReducer(initialBookingState(), quoteCreated(pendingQuote()));
    expect(state.status).toBe('streaming');
    expect(state.quote.id).toBe(9);
  });

  it('merges a streamed channel result and recomputes the best deal', () => {
    let state = bookingReducer(initialBookingState(), quoteCreated(pendingQuote()));
    state = bookingReducer(
      state,
      channelUpdate({ provider: 'airhive', status: 'priced', total: 420 }),
    );

    const airhive = state.quote.deals.find((deal) => deal.provider === 'airhive');
    expect(airhive.finished).toBe(true);
    expect(airhive.status).toBe('priced');
    expect(state.quote.topDeal).toEqual({ provider: 'airhive', total: 420 });
    expect(state.status).toBe('streaming'); // vacario still pending
  });

  it('settles once every streamed channel has finished', () => {
    let state = bookingReducer(initialBookingState(), quoteCreated(pendingQuote()));
    state = bookingReducer(
      state,
      channelUpdate({ provider: 'airhive', status: 'priced', total: 420 }),
    );
    state = bookingReducer(
      state,
      channelUpdate({ provider: 'vacario', status: 'priced', total: 300 }),
    );

    expect(state.status).toBe('settled');
    expect(state.quote.state).toBe('finished');
    expect(state.quote.topDeal).toEqual({ provider: 'vacario', total: 300 });
  });

  it('marks a channel timed out without touching the others', () => {
    let state = bookingReducer(initialBookingState(), quoteCreated(pendingQuote()));
    state = bookingReducer(
      state,
      channelUpdate({ provider: 'airhive', status: 'priced', total: 420 }),
    );
    state = bookingReducer(state, channelTimeout('vacario'));

    const vacario = state.quote.deals.find((deal) => deal.provider === 'vacario');
    expect(vacario.finished).toBe(true);
    expect(vacario.error).toBe('Timeout');
    expect(state.quote.deals.find((deal) => deal.provider === 'airhive').status).toBe('priced');
  });

  it('trusts the polled quote payload (server-computed best deal preserved)', () => {
    const polled = {
      id: 9,
      state: 'finished',
      deals: [{ provider: 'airhive', finished: true, status: 'priced', total: 300 }],
      topDeal: { provider: 'airhive', total: 300, savingsAbsolute: 50, savingsPercentage: 14 },
    };
    const state = bookingReducer(initialBookingState(), quoteUpdated(polled));
    expect(state.status).toBe('settled');
    expect(state.quote.topDeal.savingsAbsolute).toBe(50);
  });

  it('captures a quote failure', () => {
    const state = bookingReducer(initialBookingState(), quoteFailed('boom'));
    expect(state.status).toBe('error');
    expect(state.error).toBe('boom');
  });

  it('reveals a direct provider at most once', () => {
    let state = bookingReducer(initialBookingState(), revealDirect('airhive'));
    const afterFirst = state;
    state = bookingReducer(state, revealDirect('airhive'));
    expect(state.revealed).toEqual(['airhive']);
    expect(state).toBe(afterFirst); // no-op returns the same reference
  });

  it('flags the anon limit and drops back to idle', () => {
    const state = bookingReducer(initialBookingState({ status: 'creating' }), capReached());
    expect(state.capReached).toBe(true);
    expect(state.status).toBe('idle');
  });

  it('ignores channel updates before a quote exists', () => {
    const state = initialBookingState();
    expect(bookingReducer(state, channelUpdate({ provider: 'airhive' }))).toBe(state);
    expect(bookingReducer(state, channelTimeout('airhive'))).toBe(state);
  });
});
