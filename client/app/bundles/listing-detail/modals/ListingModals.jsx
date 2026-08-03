import React from 'react';
import PropTypes from 'prop-types';
import loadable from '@loadable/component';
import ModalErrorBoundary from './ModalErrorBoundary';

// Every listing-detail view modal is its own code-split chunk (loadable), pulled in only
// when opened. ssr:false keeps them out of the server render — they never open on
// first paint. ListingModals renders exactly the one useListingModals has open.
const MODALS = {
  amenities: loadable(() => import('./AmenitiesModal'), { ssr: false }),
  inquiry: loadable(() => import('./BookingInquiryModal'), { ssr: false }),
  messageHost: loadable(() => import('./MessageHostModal'), { ssr: false }),
  share: loadable(() => import('./SharePricingModal'), { ssr: false }),
  negotiate: loadable(() => import('./NegotiationWizardModal'), { ssr: false }),
  alternatives: loadable(() => import('./OtherChannelsModal'), { ssr: false }),
  featureLimit: loadable(() => import('./UsageLimitModalContainer'), { ssr: false }),
  reportReview: loadable(() => import('./ReportReviewModal'), { ssr: false }),
  priceAlert: loadable(() => import('./PriceAlertModal'), { ssr: false }),
};

export default function ListingModals({ modal, listing, currency, onClose }) {
  if (!modal.name) return null;
  const Active = MODALS[modal.name];
  if (!Active) return null;

  return (
    <ModalErrorBoundary onClose={onClose} resetKey={modal.name}>
      <Active listing={listing} payload={modal.payload} currency={currency} onClose={onClose} />
    </ModalErrorBoundary>
  );
}

ListingModals.propTypes = {
  modal: PropTypes.shape({ name: PropTypes.string, payload: PropTypes.object }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  listing: PropTypes.object.isRequired,
  currency: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
