import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from '../../../styleguide/cx';
import { imageUrl } from '../../../libs/imageUrl';
import * as style from './tile.module.scss';

// A tile's mini photo carousel: fade between photos with prev/next + dots. Keeps
// its own index; keys slides by the photo key (stable), never the array index.
export default function TilePhotoCarousel({ photos, alt, children }) {
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const go = (event, next) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex(((next % count) + count) % count);
  };

  return (
    <div className={style.carousel} data-test-id="tile-carousel">
      {photos.map((photoKey, i) => (
        <div
          key={photoKey}
          className={cx(style.slide, i === index && style.slideActive)}
          aria-hidden={i !== index}
        >
          <img
            className={style.slideImg}
            src={imageUrl(photoKey, 'tile', 1)}
            srcSet={`${imageUrl(photoKey, 'tile', 1)} 1x, ${imageUrl(photoKey, 'tile', 2)} 2x`}
            alt={`${alt} — ${i + 1}`}
            loading="lazy"
          />
        </div>
      ))}

      {children}

      {count > 1 && (
        <>
          <button
            type="button"
            className={cx(style.carouselNav, style.carouselPrev)}
            onClick={(event) => go(event, index - 1)}
            aria-label="Previous photo"
            data-test-id="tile-carousel-prev"
          >
            ‹
          </button>
          <button
            type="button"
            className={cx(style.carouselNav, style.carouselNext)}
            onClick={(event) => go(event, index + 1)}
            aria-label="Next photo"
            data-test-id="tile-carousel-next"
          >
            ›
          </button>
          <div className={style.dots}>
            {photos.map((photoKey, i) => (
              <span key={photoKey} className={cx(style.dot, i === index && style.dotActive)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

TilePhotoCarousel.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.string).isRequired,
  alt: PropTypes.string,
  children: PropTypes.node,
};
