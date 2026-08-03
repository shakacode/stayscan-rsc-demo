import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Money from '../format/Money';
import * as style from './booking.module.scss';

// Headline above the table once a best deal has settled: which channel wins and
// by how much versus the next-cheapest.
export default function TopDealBanner({ topDeal, providerLabel, currency }) {
  if (!topDeal) return null;

  return (
    <div className={style.bestBanner} data-test-id="top-deal-banner">
      <span>
        <FormattedMessage id="listingDetail.booking.topDeal" values={{ provider: providerLabel }} />
      </span>
      <span className={style.bestBannerAmount}>
        <Money amount={topDeal.total} currency={currency} />
      </span>
    </div>
  );
}

TopDealBanner.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  topDeal: PropTypes.object,
  providerLabel: PropTypes.string,
  currency: PropTypes.string,
};
