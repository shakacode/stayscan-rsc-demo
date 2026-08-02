import React from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Skeleton.module.scss';

// Shimmering placeholder for loading/streaming content.
export default function Skeleton({ width = '100%', height = 16, circle = false, className }) {
  return (
    <span
      className={cx(style.skeleton, circle && style.circle, className)}
      style={{ width, height, borderRadius: circle ? '50%' : undefined }}
      aria-hidden="true"
    />
  );
}

Skeleton.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  circle: PropTypes.bool,
  className: PropTypes.string,
};
