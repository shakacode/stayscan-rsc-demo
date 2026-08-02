import React from 'react';
import PropTypes from 'prop-types';
import RatingBar from './RatingBar';
import * as style from './content.module.scss';

// The 5→1 star distribution. `breakdown` is a { star: count } map from the JSON.
export default function RatingBreakdown({ breakdown }) {
  const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);

  return (
    <div className={style.breakdown} data-test-id="rating-breakdown">
      {[5, 4, 3, 2, 1].map((star) => (
        <RatingBar key={star} star={star} count={breakdown[star] ?? 0} total={total} />
      ))}
    </div>
  );
}

RatingBreakdown.propTypes = {
  breakdown: PropTypes.objectOf(PropTypes.number).isRequired,
};
