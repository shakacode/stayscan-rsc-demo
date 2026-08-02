import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './modals.module.scss';

// Step 2: review the inquiry before sending.
export default function InquirySummary({ values, listingTitle }) {
  return (
    <div className={style.body} data-test-id="inquiry-summary">
      <p className={style.prose}>
        <FormattedMessage
          id="listingDetail.inquiry.reviewIntro"
          values={{ listing: listingTitle }}
        />
      </p>
      <div>
        <div className={style.summaryRow}>
          <FormattedMessage id="listingDetail.inquiry.name" />
          <strong>{values.name}</strong>
        </div>
        <div className={style.summaryRow}>
          <FormattedMessage id="listingDetail.inquiry.email" />
          <strong>{values.email}</strong>
        </div>
      </div>
      {values.message && <p className={style.prose}>“{values.message}”</p>}
    </div>
  );
}

InquirySummary.propTypes = {
  values: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
  listingTitle: PropTypes.string,
};
