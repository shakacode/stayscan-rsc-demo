import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import CopyField from './CopyField';
import ShareLinkRow from './ShareLinkRow';
import * as style from './modals.module.scss';

// Share this place + its price comparison: a copyable link plus email / social
// destinations. Runs client-side only (loadable ssr:false) so window is present.
export default function SharePricingModal({ listing, onClose }) {
  const intl = useIntl();
  const url = `${window.location.origin}/listings/${listing.id}`;
  const subject = intl.formatMessage(
    { id: 'listingDetail.share.emailSubject' },
    { listing: listing.title },
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={intl.formatMessage({ id: 'listingDetail.share.title' })}
      testId="share-modal"
    >
      <div className={style.body}>
        <p className={style.prose}>
          <FormattedMessage id="listingDetail.share.intro" values={{ listing: listing.title }} />
        </p>
        <CopyField value={url} />
        <div className={style.linkList}>
          <ShareLinkRow
            icon="✉️"
            label={intl.formatMessage({ id: 'listingDetail.share.email' })}
            href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(url)}`}
          />
          <ShareLinkRow
            icon="💬"
            label={intl.formatMessage({ id: 'listingDetail.share.messenger' })}
            href={`sms:?&body=${encodeURIComponent(`${subject} ${url}`)}`}
          />
        </div>
      </div>
    </Modal>
  );
}

SharePricingModal.propTypes = {
  listing: PropTypes.shape({ id: PropTypes.number, title: PropTypes.string }).isRequired,
  onClose: PropTypes.func.isRequired,
};
