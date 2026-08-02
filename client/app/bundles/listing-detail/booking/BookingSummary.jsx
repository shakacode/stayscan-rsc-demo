import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import Money from '../format/Money';
import NightlyPrice from './NightlyPrice';
import * as style from './booking.module.scss';

// Desktop sticky summary: the settled best total (or the "from" price before a
// quote) plus the primary CTA. Hidden on mobile (MobileBookingBar covers that).
export default function BookingSummary({
  nightlyFrom,
  topDeal,
  nights,
  currency,
  canQuote,
  busy,
  onQuote,
  onInquire,
}) {
  return (
    <aside className={style.summary} data-test-id="booking-summary">
      {topDeal ? (
        <div>
          <Money amount={topDeal.total} currency={currency} />{' '}
          {nights > 0 && (
            <FormattedMessage id="listingDetail.booking.totalNights" values={{ nights }} />
          )}
        </div>
      ) : (
        <NightlyPrice amount={nightlyFrom} currency={currency} />
      )}

      {topDeal ? (
        <Button variant="primary" fullWidth onClick={onInquire}>
          <FormattedMessage id="listingDetail.booking.reserve" />
        </Button>
      ) : (
        <Button variant="primary" fullWidth disabled={!canQuote} loading={busy} onClick={onQuote}>
          <FormattedMessage id="listingDetail.booking.compareAction" />
        </Button>
      )}
    </aside>
  );
}

BookingSummary.propTypes = {
  nightlyFrom: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  topDeal: PropTypes.object,
  nights: PropTypes.number,
  currency: PropTypes.string,
  canQuote: PropTypes.bool,
  busy: PropTypes.bool,
  onQuote: PropTypes.func.isRequired,
  onInquire: PropTypes.func.isRequired,
};
