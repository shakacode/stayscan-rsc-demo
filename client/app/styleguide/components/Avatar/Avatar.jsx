import React from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Avatar.module.scss';

// Circular avatar: shows the image when `src` is given, otherwise up to two
// initials derived from the name.
export default function Avatar({ name = '', src, size = 'md' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <span
      className={cx(style.avatar, style[size])}
      role={name ? 'img' : undefined}
      aria-label={name || undefined}
    >
      {src ? (
        <img className={style.img} src={src} alt="" />
      ) : (
        <span className={style.initials} aria-hidden="true">
          {initials || '?'}
        </span>
      )}
    </span>
  );
}

Avatar.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};
