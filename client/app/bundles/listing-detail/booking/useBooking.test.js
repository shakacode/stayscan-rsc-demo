import { renderHook, act } from '@testing-library/react';
import useBooking from './useBooking';
import { QuoteLimitError } from '../api/quoteRequest';
import {
  ROW_STATE_TOP_DEAL,
  ROW_STATE_LOADING,
  ROW_STATE_LIMIT_GATED,
  ROW_STATE_REVEALED_DIRECT,
} from './useBookingRowStates';

const DATES = { checkIn: '2026-06-01', checkOut: '2026-06-03' };

const ota = (providerType, overrides = {}) => ({
  providerType,
  calendarWindow: { from: '2026-06-01', to: '2026-06-08' },
  blockedRanges: [],
  rates: [{ from: '2026-06-01', to: '2026-06-08', nightly: 200, minStay: 1 }],
  bookDirect: false,
  ...overrides,
});

const pendingQuote = () => ({
  id: 5,
  state: 'processing',
  deals: [
    { provider: 'airhive', finished: false },
    { provider: 'vacario', finished: false },
  ],
  topDeal: null,
});

function setup(deps, props = {}) {
  return renderHook(() =>
    useBooking({
      listingId: 42,
      channels: [ota('airhive'), ota('vacario')],
      user: { id: 1 },
      initialDates: DATES,
      deps,
      ...props,
    }),
  );
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useBooking', () => {
  it('creates a quote and streams per-channel results into row states', async () => {
    let onUpdate;
    const subscribeToQuote = jest.fn((quoteId, handlers) => {
      onUpdate = handlers.onUpdate;
      return jest.fn();
    });
    const createQuote = jest.fn().mockResolvedValue(pendingQuote());
    const fetchQuote = jest.fn().mockResolvedValue(pendingQuote());

    const { result } = setup({ createQuote, fetchQuote, subscribeToQuote });

    await act(async () => {
      await result.current.requestQuote();
    });

    expect(createQuote).toHaveBeenCalledWith(42, {
      check_in: '2026-06-01',
      check_out: '2026-06-03',
      adults: 1,
      children: 0,
      infants: 0,
      pets: false,
    });
    expect(subscribeToQuote).toHaveBeenCalledWith(5, expect.any(Object));
    expect(result.current.status).toBe('streaming');
    expect(result.current.rows.map((row) => row.state)).toEqual([
      ROW_STATE_LOADING,
      ROW_STATE_LOADING,
    ]);

    act(() => {
      onUpdate({ provider: 'airhive', status: 'priced', total: 420 });
    });

    const byProvider = Object.fromEntries(
      result.current.rows.map((row) => [row.channel.providerType, row.state]),
    );
    expect(byProvider.airhive).toBe(ROW_STATE_TOP_DEAL);
    expect(byProvider.vacario).toBe(ROW_STATE_LOADING);
  });

  it('reconciles to the authoritative quote via the poll fallback', async () => {
    const settled = {
      id: 5,
      state: 'finished',
      deals: [
        { provider: 'airhive', finished: true, status: 'priced', total: 300 },
        { provider: 'vacario', finished: true, status: 'priced', total: 420 },
      ],
      topDeal: { provider: 'airhive', total: 300, savingsAbsolute: 120, savingsPercentage: 28 },
    };
    const createQuote = jest.fn().mockResolvedValue(pendingQuote());
    const fetchQuote = jest.fn().mockResolvedValue(settled);
    const subscribeToQuote = jest.fn(() => jest.fn());

    const { result } = setup({ createQuote, fetchQuote, subscribeToQuote });

    await act(async () => {
      await result.current.requestQuote();
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(2_000);
    });

    expect(fetchQuote).toHaveBeenCalledWith(5);
    expect(result.current.status).toBe('settled');
    expect(result.current.quote.topDeal.savingsAbsolute).toBe(120);
  });

  it('surfaces the anon quote limit as LIMIT_GATED rows', async () => {
    const createQuote = jest
      .fn()
      .mockRejectedValue(new QuoteLimitError({ limit: 5, used: 5, remaining: 0 }));
    const { result } = setup({ createQuote, fetchQuote: jest.fn(), subscribeToQuote: jest.fn() });

    await act(async () => {
      await result.current.requestQuote();
    });

    expect(result.current.capReached).toBe(true);
    expect(result.current.rows.every((row) => row.state === ROW_STATE_LIMIT_GATED)).toBe(true);
  });

  it('reveals a direct channel', async () => {
    const { result } = setup(
      { createQuote: jest.fn(), fetchQuote: jest.fn(), subscribeToQuote: jest.fn() },
      { channels: [ota('airhive', { bookDirect: true })], user: null },
    );

    act(() => {
      result.current.reveal('airhive');
    });

    expect(result.current.rows[0].state).toBe(ROW_STATE_REVEALED_DIRECT);
  });

  it('records a request failure', async () => {
    const createQuote = jest.fn().mockRejectedValue(new Error('network down'));
    const { result } = setup({ createQuote, fetchQuote: jest.fn(), subscribeToQuote: jest.fn() });

    await act(async () => {
      await result.current.requestQuote();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('network down');
  });
});
