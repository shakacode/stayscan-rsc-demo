import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Rating from '../../../styleguide/components/Rating/Rating';
import { imageUrl } from '../../../libs/imageUrl';
import Money from '../format/Money';
import * as style from './content.module.scss';

// A compact listing card for the similar/nearby carousels — a crawlable <a>, not
// an onClick, so the links are SEO-visible.
export default function ListingTileLite({ listing, currency }) {
  return (
    <a className={style.tileLite} href={`/listings/${listing.id}`} data-test-id="similar-tile">
      {listing.photo && (
        <img
          className={style.tileLiteImg}
          src={imageUrl(listing.photo, 'tile', 1)}
          alt={listing.title}
          loading="lazy"
        />
      )}
      <div className={style.tileLiteTitle}>{listing.title}</div>
      <div className={style.tileLiteMeta}>
        {listing.city}
        {listing.rating != null && (
          <>
            {' · '}
            <Rating value={listing.rating} size="sm" />
          </>
        )}
      </div>
      {listing.previewPrice != null && (
        <div className={style.tileLiteMeta}>
          <FormattedMessage
            id="listingDetail.similar.from"
            values={{ price: <Money key="p" amount={listing.previewPrice} currency={currency} /> }}
          />
        </div>
      )}
    </a>
  );
}

ListingTileLite.propTypes = {
  listing: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    city: PropTypes.string,
    photo: PropTypes.string,
    rating: PropTypes.number,
    previewPrice: PropTypes.number,
  }).isRequired,
  currency: PropTypes.string,
};
