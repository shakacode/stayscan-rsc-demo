import React from 'react';
import PropTypes from 'prop-types';
import * as style from './content.module.scss';

// One star-tier bar in the ratings breakdown: "5 ▓▓▓▓░ 12".
export default function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className={style.breakdownRow}>
      <span>{star}★</span>
      <span className={style.bar}>
        <span className={style.barFill} style={{ width: `${pct}%` }} />
      </span>
      <span>{count}</span>
    </div>
  );
}

RatingBar.propTypes = {
  star: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
