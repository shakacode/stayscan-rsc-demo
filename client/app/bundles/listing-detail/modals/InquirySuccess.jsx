import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './modals.module.scss';

// Step 3: confirmation after the inquiry is sent.
export default function InquirySuccess({ name }) {
  return (
    <div className={style.success} data-test-id="inquiry-success">
      <div className={style.successMark} aria-hidden="true">
        ✓
      </div>
      <p className={style.prose}>
        <FormattedMessage id="listingDetail.inquiry.successBody" values={{ name }} />
      </p>
    </div>
  );
}

InquirySuccess.propTypes = {
  name: PropTypes.string,
};
