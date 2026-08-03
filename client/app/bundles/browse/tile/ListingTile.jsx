import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import cx from '../../../styleguide/cx';
import { selectMapHoverId } from '../selectors/browseSelectors';
import { selectCurrentCurrency } from '../../layout/selectors/layoutSelectors';
import { selectQuoteForListing } from '../selectors/quoteSelectors';
import { markerHovered } from '../actions';
import TilePhotoCarousel from './TilePhotoCarousel';
import TileBadges from './TileBadges';
import TileRating from './TileRating';
import TileCapacity from './TileCapacity';
import TileDistance from './TileDistance';
import TilePriceRow from './TilePriceRow';
import TileSaveButton from './TileSaveButton';
import TileShareButton from './TileShareButton';
import * as style from './tile.module.scss';

// The full result tile: photo mini-carousel with badges + save, title/city/
// distance, rating, capacity, the per-channel price row, and the save/share actions.
// Highlights in sync with its map marker; subscribes only to its own hovered boolean
// + its own live quote, so unrelated updates don't re-render it.
export default function ListingTile({ tile, center }) {
  const dispatch = useDispatch();
  const active = useSelector((state) => selectMapHoverId(state) === tile.id);
  const currency = useSelector(selectCurrentCurrency);
  const quote = useSelector((state) => selectQuoteForListing(state, tile.id));
  const photos = tile.photos && tile.photos.length > 0 ? tile.photos : [`listing/${tile.id}`];

  return (
    <li
      className={cx(style.tile, active && style.tileActive)}
      data-test-id="result-tile"
      data-active={active || undefined}
      onMouseEnter={() => dispatch(markerHovered(tile.id))}
      onMouseLeave={() => dispatch(markerHovered(null))}
    >
      <TilePhotoCarousel photos={photos} alt={tile.title}>
        <TileBadges badges={tile.badges} />
        <span className={style.saveInCarousel}>
          <TileSaveButton listingId={tile.id} compact />
        </span>
      </TilePhotoCarousel>

      <div className={style.body}>
        <div className={style.topLine}>
          <a className={style.title} href={tile.url} data-test-id="tile-title">
            {tile.title}
          </a>
          <TileRating rating={tile.rating} reviewsCount={tile.reviewsCount} />
        </div>

        <div className={style.topLine}>
          <span className={style.city}>{tile.city}</span>
          <TileDistance center={center} coordinates={tile.coordinates} />
        </div>

        <TileCapacity capacity={tile.capacity} />

        <TilePriceRow
          channels={tile.channels}
          previewPrice={tile.previewPrice}
          quote={quote}
          currency={currency?.code ?? 'USD'}
        />

        <div className={style.actions}>
          <TileShareButton url={tile.url} />
        </div>
      </div>
    </li>
  );
}

ListingTile.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  tile: PropTypes.object.isRequired,
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
};
