import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Spinner from '../../../styleguide/components/Spinner/Spinner';
import cx from '../../../styleguide/cx';
import {
  ROW_STATE_NO_CHANNEL,
  ROW_STATE_IDLE,
  ROW_STATE_UNAVAILABLE_DATES,
  ROW_STATE_MIN_STAY_VIOLATION,
  ROW_STATE_SIGN_IN_GATED,
  ROW_STATE_DIRECT_GATED,
  ROW_STATE_REVEALED_DIRECT,
  ROW_STATE_LIMIT_GATED,
  ROW_STATE_STALE,
  ROW_STATE_LOADING,
  ROW_STATE_TIMEOUT,
  ROW_STATE_ERROR,
  ROW_STATE_CALENDAR_CONTRADICTION,
  ROW_STATE_TOP_DEAL,
  ROW_STATE_PRICED_HIGHER,
  ROW_STATE_PRICED,
} from './useBookingRowStates';
import * as style from './booking.module.scss';

// The message id + severity for each row state. Every state is a distinct string
// so the table communicates *why* a channel can't be priced, not just that it can't.
const LABELS = {
  [ROW_STATE_NO_CHANNEL]: { id: 'listingDetail.row.noChannel' },
  [ROW_STATE_IDLE]: { id: 'listingDetail.row.idle' },
  [ROW_STATE_UNAVAILABLE_DATES]: { id: 'listingDetail.row.unavailableDates', error: true },
  [ROW_STATE_MIN_STAY_VIOLATION]: { id: 'listingDetail.row.minStayViolation', error: true },
  [ROW_STATE_SIGN_IN_GATED]: { id: 'listingDetail.row.signInGated' },
  [ROW_STATE_DIRECT_GATED]: { id: 'listingDetail.row.directGated' },
  [ROW_STATE_REVEALED_DIRECT]: { id: 'listingDetail.row.revealedDirect' },
  [ROW_STATE_LIMIT_GATED]: { id: 'listingDetail.row.limitGated', error: true },
  [ROW_STATE_STALE]: { id: 'listingDetail.row.stale' },
  [ROW_STATE_LOADING]: { id: 'listingDetail.row.loading', spinner: true },
  [ROW_STATE_TIMEOUT]: { id: 'listingDetail.row.timeout', error: true },
  [ROW_STATE_ERROR]: { id: 'listingDetail.row.error', error: true },
  [ROW_STATE_CALENDAR_CONTRADICTION]: {
    id: 'listingDetail.row.calendarContradiction',
    error: true,
  },
  [ROW_STATE_TOP_DEAL]: { id: 'listingDetail.row.topDeal' },
  [ROW_STATE_PRICED_HIGHER]: { id: 'listingDetail.row.pricedHigher' },
  [ROW_STATE_PRICED]: { id: 'listingDetail.row.priced' },
};

export default function RowStateLabel({ state, minStay }) {
  const label = LABELS[state] ?? LABELS[ROW_STATE_IDLE];

  return (
    <span className={cx(style.rowStatus, label.error && style.rowStatusError)}>
      {label.spinner && <Spinner size={14} />}
      <FormattedMessage id={label.id} values={{ minStay }} />
    </span>
  );
}

RowStateLabel.propTypes = {
  state: PropTypes.string.isRequired,
  minStay: PropTypes.number,
};
