import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { selectDates } from '../selectors/browseSelectors';
import { datesChanged } from '../actions';
import * as style from '../ror_components/Browse.module.scss';

// Check-in/out for the grid's live pricing. Setting both dates triggers the batch
// quote saga, and each tile's price row starts streaming its channels' prices.
export default function BrowseDates() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const dates = useSelector(selectDates);

  return (
    <div className={style.dates} data-test-id="browse-dates">
      <input
        type="date"
        className={style.dateInput}
        value={dates.checkIn || ''}
        aria-label={intl.formatMessage({ id: 'browse.dates.checkIn' })}
        onChange={(event) => dispatch(datesChanged({ checkIn: event.target.value || null }))}
        data-test-id="browse-checkin"
      />
      <span aria-hidden="true">→</span>
      <input
        type="date"
        className={style.dateInput}
        value={dates.checkOut || ''}
        aria-label={intl.formatMessage({ id: 'browse.dates.checkOut' })}
        onChange={(event) => dispatch(datesChanged({ checkOut: event.target.value || null }))}
        data-test-id="browse-checkout"
      />
    </div>
  );
}
