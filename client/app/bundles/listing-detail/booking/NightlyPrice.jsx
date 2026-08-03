import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Money from '../format/Money';
import * as style from './booking.module.scss';

// The "from $X / night" headline the widget shows before a quote is run.
export default function NightlyPrice({ amount, currency }) {
  if (amount == null) return null;

  return (
    <span className={style.fromPrice}>
      <FormattedMessage
        id="listingDetail.booking.fromNight"
        values={{
          price: <Money key="price" amount={amount} currency={currency} />,
          unit: (
            <span key="unit" className={style.fromPriceUnit}>
              {' '}
              / night
            </span>
          ),
        }}
      />
    </span>
  );
}

NightlyPrice.propTypes = {
  amount: PropTypes.number,
  currency: PropTypes.string,
};
