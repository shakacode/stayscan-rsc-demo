import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './content.module.scss';

// Opens the price-change alert modal (subscribe to drops on this listing).
export default function PriceAlertSubscribe({ onSubscribe }) {
  return (
    <button
      type="button"
      className={style.iconButton}
      onClick={onSubscribe}
      data-test-id="price-alert"
    >
      <span aria-hidden="true">🔔</span>
      <FormattedMessage id="listingDetail.actions.priceAlert" />
    </button>
  );
}

PriceAlertSubscribe.propTypes = {
  onSubscribe: PropTypes.func.isRequired,
};
