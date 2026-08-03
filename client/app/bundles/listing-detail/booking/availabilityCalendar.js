import { nightAvailable } from './useBookingAvailability';

// Turns a Date (as the day-picker hands it to us, in local time) into the
// YYYY-MM-DD the bitstrings are indexed by. Built from the local Y/M/D so the
// day the user sees is the day we look up.
export function toIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, delta) {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

// Aggregate day matchers across every channel: a night is "open" if any channel
// can be booked for it. From that we derive fully-blocked days (disable) and the
// check-in-only / check-out-only edges of open runs.
export function buildCalendar(channels = []) {
  const nightOpen = (date) => {
    const iso = toIso(date);
    return channels.some((channel) => nightAvailable(channel, iso));
  };

  const isCheckinOnly = (date) => nightOpen(date) && !nightOpen(addDays(date, -1));
  const isCheckoutOnly = (date) => !nightOpen(date) && nightOpen(addDays(date, -1));
  const isBlocked = (date) => !nightOpen(date) && !nightOpen(addDays(date, -1));

  return { nightOpen, isBlocked, isCheckinOnly, isCheckoutOnly };
}
