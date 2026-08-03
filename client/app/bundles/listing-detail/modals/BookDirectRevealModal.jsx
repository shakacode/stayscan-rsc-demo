import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';
import ModalActions from './ModalActions';
import RevealedLink from './RevealedLink';
import * as style from './modals.module.scss';

// Confirmation before revealing a book-direct link: explain the direct-booking
// trade-off, then reveal on confirm and tell the parent (so the row updates).
export default function BookDirectRevealModal({ providerLabel, directUrl, onConfirm, onClose }) {
  const intl = useIntl();
  const [revealed, setRevealed] = useState(false);

  const confirm = () => {
    setRevealed(true);
    onConfirm();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={intl.formatMessage({ id: 'listingDetail.reveal.title' })}
      testId="book-direct-reveal-modal"
    >
      <div className={style.body}>
        <p className={style.prose}>
          <FormattedMessage id="listingDetail.reveal.body" values={{ provider: providerLabel }} />
        </p>
        {revealed && <RevealedLink url={directUrl} />}
      </div>

      <ModalActions>
        {revealed ? (
          <Button variant="primary" onClick={onClose}>
            <FormattedMessage id="listingDetail.modal.done" />
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              <FormattedMessage id="listingDetail.modal.cancel" />
            </Button>
            <Button variant="primary" onClick={confirm} data-test-id="confirm-reveal">
              <FormattedMessage id="listingDetail.reveal.confirm" />
            </Button>
          </>
        )}
      </ModalActions>
    </Modal>
  );
}

BookDirectRevealModal.propTypes = {
  providerLabel: PropTypes.string,
  directUrl: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
