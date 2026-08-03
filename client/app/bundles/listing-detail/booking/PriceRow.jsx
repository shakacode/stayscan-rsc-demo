import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Badge from '../../../styleguide/components/Badge/Badge';
import cx from '../../../styleguide/cx';
import Money from '../format/Money';
import RowStateLabel from './RowStateLabel';
import SavingsBadge from './SavingsBadge';
import RevealDirectButton from './RevealDirectButton';
import {
  ROW_STATE_TOP_DEAL,
  ROW_STATE_PRICED_HIGHER,
  ROW_STATE_PRICED,
  ROW_STATE_REVEALED_DIRECT,
  ROW_STATE_SIGN_IN_GATED,
  ROW_STATE_DIRECT_GATED,
  ROW_STATE_UNAVAILABLE_DATES,
  ROW_STATE_MIN_STAY_VIOLATION,
  ROW_STATE_TIMEOUT,
  ROW_STATE_ERROR,
  ROW_STATE_CALENDAR_CONTRADICTION,
} from './useBookingRowStates';
import * as style from './booking.module.scss';

const PRICED_STATES = new Set([
  ROW_STATE_TOP_DEAL,
  ROW_STATE_PRICED_HIGHER,
  ROW_STATE_PRICED,
  ROW_STATE_REVEALED_DIRECT,
]);
const MUTED_STATES = new Set([
  ROW_STATE_UNAVAILABLE_DATES,
  ROW_STATE_MIN_STAY_VIOLATION,
  ROW_STATE_TIMEOUT,
  ROW_STATE_ERROR,
  ROW_STATE_CALENDAR_CONTRADICTION,
]);

// One channel's line in the comparison table. Purely presentational: it renders
// whatever state useBooking derived, with the price + savings for priced states
// and the reveal/sign-in action for book-direct channels.
export default function PriceRow({
  channel,
  state,
  deal,
  savings,
  minStay,
  currency,
  onReveal,
  onSignIn,
}) {
  const priced = PRICED_STATES.has(state) && deal?.total != null;
  const isBest = state === ROW_STATE_TOP_DEAL;
  const gatedDirect = state === ROW_STATE_SIGN_IN_GATED || state === ROW_STATE_DIRECT_GATED;

  return (
    <div
      className={cx(style.row, isBest && style.rowBest, MUTED_STATES.has(state) && style.rowMuted)}
      data-test-id={`price-row-${channel.providerType}`}
      data-row-state={state}
    >
      <div className={style.rowMain}>
        <span className={style.rowProvider}>
          {channel.label}
          {channel.bookDirect && (
            <Badge variant="accent">
              <FormattedMessage id="listingDetail.badge.directShort" />
            </Badge>
          )}
        </span>
        <RowStateLabel state={state} minStay={minStay} />
      </div>

      <div className={style.rowPrice}>
        {priced && (
          <>
            <Money amount={deal.total} currency={currency} />
            {isBest && savings && (
              <div>
                <SavingsBadge
                  absolute={savings.savingsAbsolute}
                  percentage={savings.savingsPercentage}
                  currency={currency}
                />
              </div>
            )}
          </>
        )}
        {channel.bookDirect && gatedDirect && (
          <RevealDirectButton
            canReveal={state === ROW_STATE_DIRECT_GATED}
            onReveal={onReveal}
            onSignIn={onSignIn}
          />
        )}
      </div>
    </div>
  );
}

PriceRow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  channel: PropTypes.object.isRequired,
  state: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  deal: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  savings: PropTypes.object,
  minStay: PropTypes.number,
  currency: PropTypes.string,
  onReveal: PropTypes.func.isRequired,
  onSignIn: PropTypes.func.isRequired,
};
