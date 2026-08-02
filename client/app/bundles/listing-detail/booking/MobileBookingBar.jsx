import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import Money from '../format/Money';
import * as style from './booking.module.scss';

// Mobile-only fixed bottom bar mirroring the desktop summary CTA.
export default function MobileBookingBar({
  nightlyFrom,
  topDeal,
  currency,
  canQuote,
  busy,
  onQuote,
  onInquire,
}) {
  const amount = topDeal ? topDeal.total : nightlyFrom;

  return (
    <div className={style.mobileBar} data-test-id="mobile-booking-bar">
      <span className={style.mobileBarPrice}>
        {amount != null ? (
          <Money amount={amount} currency={currency} />
        ) : (
          <FormattedMessage id="listingDetail.booking.checkPrices" />
        )}
      </span>
      {topDeal ? (
        <Button variant="primary" size="sm" onClick={onInquire}>
          <FormattedMessage id="listingDetail.booking.reserve" />
        </Button>
      ) : (
        <Button variant="primary" size="sm" disabled={!canQuote} loading={busy} onClick={onQuote}>
          <FormattedMessage id="listingDetail.booking.compareAction" />
        </Button>
      )}
    </div>
  );
}

MobileBookingBar.propTypes = {
  nightlyFrom: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  topDeal: PropTypes.object,
  currency: PropTypes.string,
  canQuote: PropTypes.bool,
  busy: PropTypes.bool,
  onQuote: PropTypes.func.isRequired,
  onInquire: PropTypes.func.isRequired,
};
