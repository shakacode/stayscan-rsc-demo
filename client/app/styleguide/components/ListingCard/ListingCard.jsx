import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber } from 'react-intl';
import { imageUrl } from '../../../libs/imageUrl';
import * as style from './ListingCard.module.scss';

// A store-less listing card (crawlable <a>) for the profile / trips grids, where
// there's no browse view store. The interactive grid tile lives in the browse bundle.
export default function ListingCard({ listing }) {
  const photo = (listing.photos && listing.photos[0]) || `listing/${listing.id}`;

  return (
    <a
      className={style.card}
      href={listing.url || `/listings/${listing.id}`}
      data-test-id="listing-card"
    >
      <img
        className={style.photo}
        src={imageUrl(photo, 'tile', 1)}
        alt={listing.title}
        loading="lazy"
      />
      <div className={style.body}>
        <span className={style.title}>{listing.title}</span>
        <span className={style.meta}>
          {listing.city}
          {listing.rating != null && (
            <span className={style.rating}> · ★ {listing.rating.toFixed(1)}</span>
          )}
        </span>
        {listing.previewPrice != null && (
          <span className={style.price}>
            <FormattedNumber
              value={listing.previewPrice}
              style="currency"
              currency="USD"
              maximumFractionDigits={0}
            />
          </span>
        )}
      </div>
    </a>
  );
}

ListingCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  listing: PropTypes.object.isRequired,
};
