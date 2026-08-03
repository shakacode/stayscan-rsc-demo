import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber } from 'react-intl';

// One place the listing-detail view formats prices, so currency + rounding stay consistent across
// the booking table, banners and carousels.
export default function Money({ amount, currency = 'USD', fractionDigits = 0 }) {
  return (
    <FormattedNumber
      value={amount}
      style="currency"
      currency={currency}
      minimumFractionDigits={fractionDigits}
      maximumFractionDigits={fractionDigits}
    />
  );
}

Money.propTypes = {
  amount: PropTypes.number.isRequired,
  currency: PropTypes.string,
  fractionDigits: PropTypes.number,
};
