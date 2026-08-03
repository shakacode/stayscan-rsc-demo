import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Rating from '../../../styleguide/components/Rating/Rating';
import * as style from './content.module.scss';

// A single guest review: author, star rating, source channel, the text, and a
// report action.
export default function ReviewCard({ review, onReport }) {
  return (
    <article className={style.review} data-test-id="review-card">
      <div className={style.reviewHead}>
        <span className={style.reviewAuthor}>{review.author}</span>
        <Rating value={review.rating} size="sm" />
        {review.provider && <span className={style.reviewMeta}>· {review.provider}</span>}
        <button
          type="button"
          className={style.iconButton}
          onClick={() => onReport(review)}
          data-test-id="report-review"
        >
          <FormattedMessage id="listingDetail.reviews.report" />
        </button>
      </div>
      <p className={style.reviewBody}>{review.content}</p>
    </article>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    author: PropTypes.string,
    rating: PropTypes.number,
    content: PropTypes.string,
    provider: PropTypes.string,
  }).isRequired,
  onReport: PropTypes.func.isRequired,
};
