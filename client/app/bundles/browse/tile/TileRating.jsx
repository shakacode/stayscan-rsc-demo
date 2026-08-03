import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './tile.module.scss';

// Compact rating: star glyph + score + review count.
export default function TileRating({ rating, reviewsCount }) {
  if (rating == null) return null;

  return (
    <span className={style.rating} data-test-id="tile-rating">
      <span className={style.ratingStar} aria-hidden="true">
        ★
      </span>
      {rating.toFixed(1)}
      {reviewsCount > 0 && (
        <span className={style.ratingCount}>
          (<FormattedMessage id="browse.tile.reviews" values={{ count: reviewsCount }} />)
        </span>
      )}
    </span>
  );
}

TileRating.propTypes = {
  rating: PropTypes.number,
  reviewsCount: PropTypes.number,
};
