import React, { useId } from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Rating.module.scss';

function StarShape({ state }) {
  const gradientId = useId();
  const fill =
    state === 'full' ? 'currentColor' : state === 'half' ? `url(#${gradientId})` : 'none';
  return (
    <svg viewBox="0 0 24 24" className={style.star} aria-hidden="true">
      {state === 'half' && (
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"
        fill={fill}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

StarShape.propTypes = { state: PropTypes.oneOf(['full', 'half', 'empty']).isRequired };

// Star rating. Read-only (a labelled image) unless `onChange` is passed, which
// makes it an interactive radiogroup.
export default function Rating({ value, max = 5, onChange, size = 'md', label }) {
  const rounded = Math.round(value * 2) / 2;
  const stars = Array.from({ length: max }, (_, i) => {
    const position = i + 1;
    if (rounded >= position) return { position, state: 'full' };
    if (rounded >= position - 0.5) return { position, state: 'half' };
    return { position, state: 'empty' };
  });

  if (!onChange) {
    return (
      <span
        className={cx(style.rating, style[size])}
        role="img"
        aria-label={label ?? `${value} out of ${max} stars`}
      >
        {stars.map((star) => (
          <StarShape key={star.position} state={star.state} />
        ))}
      </span>
    );
  }

  return (
    <span
      className={cx(style.rating, style.interactive, style[size])}
      role="radiogroup"
      aria-label={label ?? 'Rating'}
    >
      {stars.map((star) => (
        <button
          key={star.position}
          type="button"
          className={style.starButton}
          aria-label={`${star.position} star${star.position > 1 ? 's' : ''}`}
          aria-pressed={value >= star.position}
          onClick={() => onChange(star.position)}
        >
          <StarShape state={value >= star.position ? 'full' : 'empty'} />
        </button>
      ))}
    </span>
  );
}

Rating.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  onChange: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
};
