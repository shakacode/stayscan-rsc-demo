import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Rating from '../../../styleguide/components/Rating/Rating';
import { fetchReviews as defaultFetchReviews } from '../api/reviewsRequest';
import SectionHeading from './SectionHeading';
import ReviewAiTabs from './ReviewAiTabs';
import RatingBreakdown from './RatingBreakdown';
import ReviewList from './ReviewList';
import Pagination from './Pagination';
import * as style from './content.module.scss';

// The reviews section: AI summaries + the ratings breakdown alongside the paged
// review list. Page 1 is seeded from the listing-detail view JSON; further pages are fetched.
export default function Reviews({
  listingId,
  reviews,
  aiContent,
  rating,
  onReport = () => {},
  deps = {},
}) {
  const fetchReviews = deps.fetchReviews ?? defaultFetchReviews;
  const [page, setPage] = useState(reviews.page);
  const [items, setItems] = useState(reviews.items);
  const [loading, setLoading] = useState(false);

  if (reviews.total === 0) return null;

  const goToPage = async (next) => {
    setLoading(true);
    try {
      const data = await fetchReviews(listingId, next);
      setItems(data.items);
      setPage(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={style.section} data-test-id="reviews-section">
      <SectionHeading
        titleId="listingDetail.reviews.titleCount"
        values={{ count: reviews.total }}
        action={rating != null ? <Rating value={rating} size="md" /> : null}
      />

      <ReviewAiTabs
        reviewsSummary={reviews.aiSummary}
        nearbyHighlights={aiContent?.nearbyHighlights}
        fromTheHost={aiContent?.fromTheHost}
      />

      <div className={style.reviewsLayout}>
        <RatingBreakdown breakdown={reviews.ratingBreakdown} />
        <div>
          <ReviewList reviews={items} onReport={onReport} />
          <Pagination
            page={page}
            perPage={reviews.perPage}
            total={reviews.total}
            loading={loading}
            onPage={goToPage}
          />
        </div>
      </div>
    </section>
  );
}

Reviews.propTypes = {
  listingId: PropTypes.number.isRequired,
  reviews: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
    total: PropTypes.number,
    items: PropTypes.arrayOf(PropTypes.object),
    ratingBreakdown: PropTypes.objectOf(PropTypes.number),
    aiSummary: PropTypes.string,
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  aiContent: PropTypes.object,
  rating: PropTypes.number,
  onReport: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  deps: PropTypes.object,
};
