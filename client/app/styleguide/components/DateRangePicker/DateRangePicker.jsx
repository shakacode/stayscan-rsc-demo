import React from 'react';
import PropTypes from 'prop-types';
import DayPicker, { DateUtils } from 'react-day-picker';
// Base react-day-picker CSS is loaded once from the client pack (packs/application.js)
// so it never enters the SSR server bundle (its css-loader runtime needs `URL`).
import * as style from './DateRangePicker.module.scss';

// react-day-picker 7 wrapper for a check-in/check-out range. Range assembly is
// the library's DateUtils.addDayToRange; we own the value shape { from, to } and
// block past dates. `disabledMatcher` (a day -> bool predicate) and `modifiers`
// are optional so the booking widget can grey out calendar-blocked nights and
// tag check-in-only days without other callers needing them.
export default function DateRangePicker({
  value,
  onChange,
  numberOfMonths = 2,
  disabledBefore,
  disabledMatcher,
  modifiers,
  modifiersStyles,
}) {
  const from = value?.from ?? null;
  const to = value?.to ?? null;

  const handleDayClick = (day, dayModifiers = {}) => {
    if (dayModifiers.disabled) return;
    onChange(DateUtils.addDayToRange(day, { from, to }));
  };

  const disabledDays = [
    disabledBefore ? { before: disabledBefore } : null,
    disabledMatcher || null,
  ].filter(Boolean);

  return (
    <div className={style.picker}>
      <DayPicker
        numberOfMonths={numberOfMonths}
        selectedDays={from ? [from, { from, to }] : undefined}
        modifiers={{ start: from, end: to, ...modifiers }}
        modifiersStyles={modifiersStyles}
        disabledDays={disabledDays.length ? disabledDays : undefined}
        onDayClick={handleDayClick}
      />
    </div>
  );
}

DateRangePicker.propTypes = {
  value: PropTypes.shape({ from: PropTypes.instanceOf(Date), to: PropTypes.instanceOf(Date) }),
  onChange: PropTypes.func.isRequired,
  numberOfMonths: PropTypes.number,
  disabledBefore: PropTypes.instanceOf(Date),
  disabledMatcher: PropTypes.func,
  // react-day-picker modifier map (name -> day matcher); merged with start/end.
  // eslint-disable-next-line react/forbid-prop-types
  modifiers: PropTypes.object,
  // Inline styles keyed by modifier name (e.g. check-in-only day wedges).
  // eslint-disable-next-line react/forbid-prop-types
  modifiersStyles: PropTypes.object,
};
