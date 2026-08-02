// Offline availability evaluation for the booking widget: reads the per-channel
// calendar window, blackout ranges and rate ranges shipped in ListingDetailJson
// so the date picker and row states can be computed without a round-trip.
//
// Ranges are half-open [from, to) ISO date strings, exactly as Postgres stores
// them, so a night falls in a range when from <= night < to. Comparing the
// strings directly is safe because ISO dates sort lexicographically, and it
// keeps every night out of Date parsing.

const MS_PER_DAY = 86_400_000;

function toDayNumber(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

function toIso(dayNumber) {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

export function nightsBetween(checkInIso, checkOutIso) {
  if (!checkInIso || !checkOutIso) return 0;
  return toDayNumber(checkOutIso) - toDayNumber(checkInIso);
}

function covers(range, dateIso) {
  return !!range && range.from <= dateIso && dateIso < range.to;
}

// A night outside the window is one the provider never told us about, so the
// channel's default decides rather than the ranges.
function known(channel, dateIso) {
  return covers(channel.calendarWindow, dateIso);
}

function blocked(channel, dateIso) {
  return (channel.blockedRanges || []).some((range) => covers(range, dateIso));
}

function rateAt(channel, dateIso) {
  return (channel.rates || []).find((rate) => covers(rate, dateIso));
}

// Is a single night bookable on this channel?
export function nightAvailable(channel, dateIso) {
  if (!dateIso) return false;
  if (!known(channel, dateIso)) return !!channel.availabilityConstant;
  return !blocked(channel, dateIso);
}

// The minimum stay required for a check-in on the given date.
export function minStayAt(channel, checkInIso) {
  if (!checkInIso) return 1;
  return rateAt(channel, checkInIso)?.minStay || 1;
}

// Evaluate a whole check-in..check-out range for one channel.
export function evaluateRange(channel, { checkIn, checkOut }) {
  if (!checkIn || !checkOut) {
    return { available: true, minStayOk: true, minStay: 1, nights: 0, blockedNights: [] };
  }

  const nights = nightsBetween(checkIn, checkOut);
  const firstNight = toDayNumber(checkIn);
  const blockedNights = [];

  for (let i = 0; i < nights; i += 1) {
    if (!nightAvailable(channel, toIso(firstNight + i))) blockedNights.push(i);
  }

  const minStay = minStayAt(channel, checkIn);
  return {
    available: blockedNights.length === 0 && nights > 0,
    minStayOk: nights >= minStay,
    minStay,
    nights,
    blockedNights,
  };
}
