import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';
import ModalActions from './ModalActions';
import * as style from './modals.module.scss';

// Quick "message the host" composer. On send it confirms in place (MVP — no
// backend); the host section's CTA opens it.
export default function MessageHostModal({ listing, onClose }) {
  const intl = useIntl();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={intl.formatMessage({ id: 'listingDetail.message.title' })}
      testId="message-host-modal"
    >
      {sent ? (
        <div className={style.success} data-test-id="message-sent">
          <div className={style.successMark} aria-hidden="true">
            ✓
          </div>
          <p className={style.prose}>
            <FormattedMessage id="listingDetail.message.sent" />
          </p>
        </div>
      ) : (
        <div className={style.body}>
          <p className={style.prose}>
            <FormattedMessage
              id="listingDetail.message.intro"
              values={{ listing: listing.title }}
            />
          </p>
          <textarea
            className={style.textarea}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-label={intl.formatMessage({ id: 'listingDetail.message.title' })}
            data-test-id="message-body"
          />
        </div>
      )}

      <ModalActions>
        {sent ? (
          <Button variant="primary" onClick={onClose}>
            <FormattedMessage id="listingDetail.modal.done" />
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={message.trim().length === 0}
            onClick={() => setSent(true)}
            data-test-id="message-send"
          >
            <FormattedMessage id="listingDetail.message.send" />
          </Button>
        )}
      </ModalActions>
    </Modal>
  );
}

MessageHostModal.propTypes = {
  listing: PropTypes.shape({ title: PropTypes.string }).isRequired,
  onClose: PropTypes.func.isRequired,
};
