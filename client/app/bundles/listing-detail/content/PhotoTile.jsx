import React from 'react';
import PropTypes from 'prop-types';
import cx from '../../../styleguide/cx';
import { imageUrl } from '../../../libs/imageUrl';
import * as style from './content.module.scss';

// One gallery cell. Clicking opens the lightbox at this photo's index. The image
// srcset comes from the shared imageUrl variant builder (memo surface).
export default function PhotoTile({ photoKey, index, size = 'tile', hero = false, alt, onOpen }) {
  return (
    <figure className={cx(style.tile, hero && style.heroTile)}>
      <button
        type="button"
        className={style.tileImg}
        onClick={() => onOpen(index)}
        aria-label={alt}
      >
        <img
          className={style.tileImg}
          src={imageUrl(photoKey, size, 1)}
          srcSet={`${imageUrl(photoKey, size, 1)} 1x, ${imageUrl(photoKey, size, 2)} 2x`}
          alt={alt}
          loading={hero ? 'eager' : 'lazy'}
        />
      </button>
    </figure>
  );
}

PhotoTile.propTypes = {
  photoKey: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['thumb', 'tile', 'gallery', 'hero']),
  hero: PropTypes.bool,
  alt: PropTypes.string,
  onOpen: PropTypes.func.isRequired,
};
