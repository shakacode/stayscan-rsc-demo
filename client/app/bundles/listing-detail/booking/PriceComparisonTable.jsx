import React from 'react';
import PropTypes from 'prop-types';
import PriceRow from './PriceRow';
import { minStayAt } from './useBookingAvailability';
import * as style from './booking.module.scss';

// The multi-channel price table. Looks up each channel's deal + min-stay and
// hands one PriceRow per channel; the top-deal savings ride along on that row.
export default function PriceComparisonTable({
  rows,
  quote,
  checkIn,
  currency,
  onReveal,
  onSignIn,
}) {
  const dealFor = (providerType) => quote?.deals?.find((deal) => deal.provider === providerType);
  const savings = quote?.topDeal;

  return (
    <div className={style.table} data-test-id="price-comparison-table">
      {rows.map(({ channel, state }) => (
        <PriceRow
          key={channel.providerType}
          channel={channel}
          state={state}
          deal={dealFor(channel.providerType)}
          savings={savings?.provider === channel.providerType ? savings : null}
          minStay={checkIn ? minStayAt(channel, checkIn) : undefined}
          currency={currency}
          onReveal={() => onReveal(channel.providerType)}
          onSignIn={onSignIn}
        />
      ))}
    </div>
  );
}

PriceComparisonTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  quote: PropTypes.object,
  checkIn: PropTypes.string,
  currency: PropTypes.string,
  onReveal: PropTypes.func.isRequired,
  onSignIn: PropTypes.func.isRequired,
};
