import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReviewCard from './ReviewCard';
import * as style from './content.module.scss';

// The current page of reviews. Keyed by review id (stable), never the index.
export default function ReviewList({ reviews, onReport }) {
  if (reviews.length === 0) {
    return (
      <p className={style.reviewMeta}>
        <FormattedMessage id="listingDetail.reviews.empty" />
      </p>
    );
  }

  return (
    <div className={style.reviewList} data-test-id="review-list">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} onReport={onReport} />
      ))}
    </div>
  );
}

ReviewList.propTypes = {
  reviews: PropTypes.arrayOf(PropTypes.object).isRequired,
  onReport: PropTypes.func.isRequired,
};
