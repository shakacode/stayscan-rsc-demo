import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Spinner from '../../../styleguide/components/Spinner/Spinner';
import Button from '../../../styleguide/components/Button/Button';
import * as style from './booking.module.scss';

// The quote lifecycle's out-of-band feedback: the streaming spinner, a retryable
// error, and the anonymous-limit prompt that opens the usage-limit modal.
export default function QuoteStatusBanner({ status, capReached, onShowLimit, onRetry }) {
  if (capReached) {
    return (
      <div className={`${style.banner} ${style.bannerInfo}`} data-test-id="quote-limit-banner">
        <FormattedMessage id="listingDetail.booking.capReached" />{' '}
        <Button variant="ghost" size="sm" onClick={onShowLimit}>
          <FormattedMessage id="listingDetail.booking.limitAction" />
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`${style.banner} ${style.bannerError}`} data-test-id="quote-error-banner">
        <FormattedMessage id="listingDetail.booking.quoteError" />{' '}
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <FormattedMessage id="listingDetail.booking.retry" />
        </Button>
      </div>
    );
  }

  if (status === 'creating' || status === 'streaming') {
    return (
      <div className={style.streaming} data-test-id="quote-streaming">
        <Spinner size={18} />
        <FormattedMessage id="listingDetail.booking.fetchingLive" />
      </div>
    );
  }

  return null;
}

QuoteStatusBanner.propTypes = {
  status: PropTypes.string.isRequired,
  capReached: PropTypes.bool.isRequired,
  onShowLimit: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
};
