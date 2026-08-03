import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';
import RadioRow from '../../../styleguide/components/RadioRow/RadioRow';
import ModalActions from './ModalActions';
import * as style from './modals.module.scss';

const REASONS = ['spam', 'offensive', 'inaccurate', 'fake'];

// Report a review. Reason picker → confirmation (MVP: no backend). Opened with a
// { author } payload from the review card.
export default function ReportReviewModal({ payload, onClose }) {
  const intl = useIntl();
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={intl.formatMessage({ id: 'listingDetail.reportReview.title' })}
      testId="report-review-modal"
    >
      {done ? (
        <div className={style.success} data-test-id="report-review-done">
          <div className={style.successMark} aria-hidden="true">
            ✓
          </div>
          <p className={style.prose}>
            <FormattedMessage id="listingDetail.reportReview.done" />
          </p>
        </div>
      ) : (
        <div className={style.body}>
          <p className={style.prose}>
            <FormattedMessage
              id="listingDetail.reportReview.intro"
              values={{ author: payload?.author }}
            />
          </p>
          {REASONS.map((option) => (
            <RadioRow
              key={option}
              name="report-review-reason"
              value={option}
              checked={reason === option}
              onChange={() => setReason(option)}
              label={<FormattedMessage id={`listingDetail.reportReview.reason.${option}`} />}
            />
          ))}
        </div>
      )}

      <ModalActions>
        {done ? (
          <Button variant="primary" onClick={onClose}>
            <FormattedMessage id="listingDetail.modal.done" />
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={!reason}
            onClick={() => setDone(true)}
            data-test-id="report-review-submit"
          >
            <FormattedMessage id="listingDetail.reportReview.submit" />
          </Button>
        )}
      </ModalActions>
    </Modal>
  );
}

ReportReviewModal.propTypes = {
  payload: PropTypes.shape({ author: PropTypes.string }),
  onClose: PropTypes.func.isRequired,
};
