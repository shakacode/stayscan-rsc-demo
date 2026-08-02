import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import DateRangePicker from '../../../styleguide/components/DateRangePicker/DateRangePicker';
import { buildCalendar, toIso } from './availabilityCalendar';

function isoToDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Modifier styling that survives SSR (inline, not CSS-module classes): the two
// edges of an open run are wedged so a guest sees a night is check-in-only or
// check-out-only, not fully open.
const MODIFIER_STYLES = {
  checkinOnly: { background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.08) 50%)' },
  checkoutOnly: { background: 'linear-gradient(-45deg, transparent 50%, rgba(0,0,0,0.08) 50%)' },
};

// The check-in/check-out picker, wired to the aggregate channel calendar: fully
// blocked nights are disabled, and the open-run edges get the check-in/out-only
// treatment. Owns Date<->iso conversion so useBooking only ever sees iso strings.
export default function BookingDatePicker({ dates, channels, onChange }) {
  const calendar = useMemo(() => buildCalendar(channels), [channels]);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const value = {
    from: dates.checkIn ? isoToDate(dates.checkIn) : null,
    to: dates.checkOut ? isoToDate(dates.checkOut) : null,
  };

  const handleChange = (range) =>
    onChange({
      checkIn: range?.from ? toIso(range.from) : null,
      checkOut: range?.to ? toIso(range.to) : null,
    });

  return (
    <div data-test-id="booking-date-picker">
      <DateRangePicker
        value={value}
        onChange={handleChange}
        disabledBefore={today}
        disabledMatcher={calendar.isBlocked}
        modifiers={{ checkinOnly: calendar.isCheckinOnly, checkoutOnly: calendar.isCheckoutOnly }}
        modifiersStyles={MODIFIER_STYLES}
      />
    </div>
  );
}

BookingDatePicker.propTypes = {
  dates: PropTypes.shape({ checkIn: PropTypes.string, checkOut: PropTypes.string }).isRequired,
  channels: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
};
