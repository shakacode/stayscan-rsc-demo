import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Input from '../../../styleguide/components/Input/Input';
import Button from '../../../styleguide/components/Button/Button';
import ModalActions from './ModalActions';
import * as style from './modals.module.scss';

const EMAIL = /.+@.+\..+/;

// Subscribe to price-drop alerts for this listing. Email → confirmation
// (MVP: no backend). The "watch price" action opens it.
export default function PriceAlertModal({ listing, onClose }) {
  const intl = useIntl();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [subscribed, setSubscribed] = useState(false);

  const submit = () => {
    if (!EMAIL.test(email)) {
      setError(intl.formatMessage({ id: 'listingDetail.priceAlert.errorEmail' }));
      return;
    }
    setSubscribed(true);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={intl.formatMessage({ id: 'listingDetail.priceAlert.title' })}
      testId="price-alert-modal"
    >
      {subscribed ? (
        <div className={style.success} data-test-id="price-alert-subscribed">
          <div className={style.successMark} aria-hidden="true">
            🔔
          </div>
          <p className={style.prose}>
            <FormattedMessage id="listingDetail.priceAlert.subscribed" values={{ email }} />
          </p>
        </div>
      ) : (
        <div className={style.body}>
          <p className={style.prose}>
            <FormattedMessage
              id="listingDetail.priceAlert.intro"
              values={{ listing: listing.title }}
            />
          </p>
          <Input
            type="email"
            label={intl.formatMessage({ id: 'listingDetail.priceAlert.email' })}
            value={email}
            error={error}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            data-test-id="price-alert-email"
          />
        </div>
      )}

      <ModalActions>
        {subscribed ? (
          <Button variant="primary" onClick={onClose}>
            <FormattedMessage id="listingDetail.modal.done" />
          </Button>
        ) : (
          <Button variant="primary" onClick={submit} data-test-id="price-alert-subscribe">
            <FormattedMessage id="listingDetail.priceAlert.subscribe" />
          </Button>
        )}
      </ModalActions>
    </Modal>
  );
}

PriceAlertModal.propTypes = {
  listing: PropTypes.shape({ title: PropTypes.string }).isRequired,
  onClose: PropTypes.func.isRequired,
};
