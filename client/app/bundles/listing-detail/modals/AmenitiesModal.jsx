import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import AmenityItem from '../content/AmenityItem';
import * as contentStyle from '../content/content.module.scss';

// The full amenities list (the grid shows a preview; this shows them all).
export default function AmenitiesModal({ listing, onClose }) {
  const intl = useIntl();

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={intl.formatMessage({ id: 'listingDetail.amenities.title' })}
      testId="amenities-modal"
      size="lg"
    >
      <div className={contentStyle.amenityModalList}>
        {listing.amenities.map((name) => (
          <AmenityItem key={name} name={name} />
        ))}
      </div>
    </Modal>
  );
}

AmenitiesModal.propTypes = {
  listing: PropTypes.shape({ amenities: PropTypes.arrayOf(PropTypes.string) }).isRequired,
  onClose: PropTypes.func.isRequired,
};
