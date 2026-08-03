import { nightsBetween, nightAvailable, minStayAt, evaluateRange } from './useBookingAvailability';

// A channel whose calendar covers 2026-06-01..2026-06-07: every night open
// except 06-06, and a 2-night minimum on the first night only.
const channel = {
  providerType: 'airhive',
  calendarWindow: { from: '2026-06-01', to: '2026-06-07' },
  blockedRanges: [{ from: '2026-06-06', to: '2026-06-07' }],
  rates: [
    { from: '2026-06-01', to: '2026-06-02', nightly: 200, minStay: 2 },
    { from: '2026-06-02', to: '2026-06-07', nightly: 200, minStay: 1 },
  ],
};

describe('nightsBetween', () => {
  it('counts nights between check-in and check-out', () => {
    expect(nightsBetween('2026-06-01', '2026-06-04')).toBe(3);
    expect(nightsBetween('2026-06-01', '2026-06-01')).toBe(0);
    expect(nightsBetween(null, '2026-06-04')).toBe(0);
  });

  it('counts across a DST boundary without drifting (UTC day numbers)', () => {
    expect(nightsBetween('2026-03-01', '2026-03-31')).toBe(30);
  });
});

describe('nightAvailable', () => {
  it('is open unless a blackout range covers the night', () => {
    expect(nightAvailable(channel, '2026-06-01')).toBe(true);
    expect(nightAvailable(channel, '2026-06-06')).toBe(false);
  });

  it('falls back to the channel default outside the known window', () => {
    expect(nightAvailable(channel, '2026-05-31')).toBe(false);
    expect(nightAvailable(channel, '2026-07-01')).toBe(false);
  });

  it('is always open for an always-available channel', () => {
    expect(nightAvailable({ availabilityConstant: true }, '2020-01-01')).toBe(true);
  });
});

describe('minStayAt', () => {
  it('returns the minimum stay of the rate range covering the check-in', () => {
    expect(minStayAt(channel, '2026-06-01')).toBe(2);
    expect(minStayAt(channel, '2026-06-02')).toBe(1);
  });

  it('defaults to 1 when no rate range covers the date', () => {
    expect(minStayAt(channel, '2026-05-01')).toBe(1);
    expect(minStayAt({ rates: [] }, '2026-06-01')).toBe(1);
  });
});

describe('evaluateRange', () => {
  it('is available with no blocked nights and min-stay met', () => {
    const result = evaluateRange(channel, { checkIn: '2026-06-01', checkOut: '2026-06-03' });
    expect(result).toEqual({
      available: true,
      minStayOk: true,
      minStay: 2,
      nights: 2,
      blockedNights: [],
    });
  });

  it('reports the specific blocked night index', () => {
    const result = evaluateRange(channel, { checkIn: '2026-06-04', checkOut: '2026-06-07' });
    expect(result.available).toBe(false);
    // nights 06-04 / 06-05 / 06-06 -> the blackout covers the third (index 2)
    expect(result.blockedNights).toEqual([2]);
  });

  it('flags a min-stay violation while still available', () => {
    const result = evaluateRange(channel, { checkIn: '2026-06-01', checkOut: '2026-06-02' });
    expect(result.available).toBe(true);
    expect(result.minStayOk).toBe(false);
    expect(result.minStay).toBe(2);
  });

  it('treats an empty range as vacuously available', () => {
    expect(evaluateRange(channel, { checkIn: null, checkOut: null })).toEqual({
      available: true,
      minStayOk: true,
      minStay: 1,
      nights: 0,
      blockedNights: [],
    });
  });
});
