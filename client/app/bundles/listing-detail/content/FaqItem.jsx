import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from '../../../styleguide/cx';
import * as style from './content.module.scss';

// One expandable question in the listing-detail view FAQ.
export default function FaqItem({ questionId, answerId }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={style.faqItem} data-test-id="faq-item">
      <button
        type="button"
        className={style.faqQuestion}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <FormattedMessage id={questionId} />
        <span aria-hidden="true" className={cx(style.faqChevron, open && style.faqChevronOpen)}>
          ⌄
        </span>
      </button>
      {open && (
        <p className={style.faqAnswer}>
          <FormattedMessage id={answerId} />
        </p>
      )}
    </div>
  );
}

FaqItem.propTypes = {
  questionId: PropTypes.string.isRequired,
  answerId: PropTypes.string.isRequired,
};
