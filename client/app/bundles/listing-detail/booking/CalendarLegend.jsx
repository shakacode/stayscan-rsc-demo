import React from 'react';
import { FormattedMessage } from 'react-intl';
import * as style from './booking.module.scss';

// Legend for the date picker so guests can read the calendar shading: open nights
// vs blocked vs the check-in/check-out-only edges of an open run.
const ITEMS = [
  {
    key: 'available',
    className: style.legendAvailable,
    id: 'listingDetail.calendar.legendAvailable',
  },
  { key: 'blocked', className: style.legendBlocked, id: 'listingDetail.calendar.legendBlocked' },
  {
    key: 'checkinOnly',
    className: style.legendEdge,
    id: 'listingDetail.calendar.legendCheckinOnly',
  },
];

export default function CalendarLegend() {
  return (
    <ul className={style.legend} data-test-id="calendar-legend">
      {ITEMS.map((item) => (
        <li key={item.key} className={style.legendItem}>
          <span className={`${style.legendSwatch} ${item.className}`} aria-hidden="true" />
          <FormattedMessage id={item.id} />
        </li>
      ))}
    </ul>
  );
}
