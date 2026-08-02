import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Rating from '../../../styleguide/components/Rating/Rating';
import CapacitySummary from './CapacitySummary';
import ListingBadges from './ListingBadges';
import ActionBar from './ActionBar';
import * as style from './content.module.scss';

// The title block: name, rating + review count, capacity, badges and the action
// bar (save / share / price alert).
export default function ListingHeader({ listing, saved, onSave, onShare, onPriceAlert }) {
  return (
    <header data-test-id="listing-header">
      <h1>{listing.title}</h1>
      <div className={style.reviewMeta}>
        {listing.city}
        {listing.rating != null && (
          <>
            {' · '}
            <Rating value={listing.rating} size="sm" />{' '}
            <FormattedMessage
              id="listingDetail.reviews.count"
              values={{ count: listing.reviewsCount }}
            />
          </>
        )}
      </div>
      <CapacitySummary capacity={listing.capacity} />
      <ListingBadges badges={listing.badges} />
      <ActionBar saved={saved} onSave={onSave} onShare={onShare} onPriceAlert={onPriceAlert} />
    </header>
  );
}

ListingHeader.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  listing: PropTypes.object.isRequired,
  saved: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onPriceAlert: PropTypes.func.isRequired,
};
