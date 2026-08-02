import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';

// Shown by ModalErrorBoundary when a lazy modal chunk fails to load or throws, so
// a broken modal degrades to a dismissible message instead of a blank overlay.
export default function ModalErrorFallback({ onClose }) {
  return (
    <Modal isOpen onClose={onClose} title="" testId="modal-error">
      <p>
        <FormattedMessage id="listingDetail.modal.error" />
      </p>
      <Button variant="primary" onClick={onClose}>
        <FormattedMessage id="listingDetail.modal.close" />
      </Button>
    </Modal>
  );
}

ModalErrorFallback.propTypes = {
  onClose: PropTypes.func.isRequired,
};
