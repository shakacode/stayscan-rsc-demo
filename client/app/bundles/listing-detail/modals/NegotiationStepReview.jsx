import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Money from '../format/Money';
import * as style from './modals.module.scss';

// Wizard step 3: review the offer before sending it to the host.
export default function NegotiationStepReview({ targetPrice, flexibility, currency }) {
  return (
    <div className={style.body} data-test-id="negotiate-review">
      <div className={style.summaryRow}>
        <FormattedMessage id="listingDetail.negotiate.targetLabel" />
        <strong>
          <Money amount={Number(targetPrice)} currency={currency} />
        </strong>
      </div>
      <div className={style.summaryRow}>
        <FormattedMessage id="listingDetail.negotiate.flexLabel" />
        <strong>
          <FormattedMessage id={`listingDetail.negotiate.flex.${flexibility}`} />
        </strong>
      </div>
      <p className={style.muted}>
        <FormattedMessage id="listingDetail.negotiate.reviewNote" />
      </p>
    </div>
  );
}

NegotiationStepReview.propTypes = {
  targetPrice: PropTypes.string.isRequired,
  flexibility: PropTypes.string.isRequired,
  currency: PropTypes.string,
};
