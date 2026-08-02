import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { imageUrl } from '../../../libs/imageUrl';
import LightboxThumbnail from './LightboxThumbnail';
import * as style from './content.module.scss';

// Full-screen photo viewer (our stand-in for a PhotoSwipe-style lightbox): arrow
// keys / on-screen nav / a thumbnail filmstrip, Escape to close. Portals to body
// and is only mounted while open, so nothing runs during SSR.
export default function Lightbox({ photos, index, onIndex, onClose, alt }) {
  const count = photos.length;
  const go = useCallback((next) => onIndex(((next % count) + count) % count), [count, onIndex]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') go(index + 1);
      if (event.key === 'ArrowLeft') go(index - 1);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [index, go, onClose]);

  return createPortal(
    <div className={style.lightbox} role="dialog" aria-modal="true" data-test-id="photo-lightbox">
      <div className={style.lightboxBar}>
        <span>
          <FormattedMessage
            id="listingDetail.gallery.counter"
            values={{ current: index + 1, total: count }}
          />
        </span>
        <button
          type="button"
          className={style.iconButton}
          onClick={onClose}
          data-test-id="lightbox-close"
        >
          <FormattedMessage id="listingDetail.gallery.close" />
        </button>
      </div>

      <div className={style.lightboxStage}>
        <button
          type="button"
          className={`${style.lightboxNav} ${style.lightboxPrev}`}
          onClick={() => go(index - 1)}
          aria-label="Previous"
          data-test-id="lightbox-prev"
        >
          ‹
        </button>
        <img className={style.lightboxImg} src={imageUrl(photos[index], 'gallery', 2)} alt={alt} />
        <button
          type="button"
          className={`${style.lightboxNav} ${style.lightboxNext}`}
          onClick={() => go(index + 1)}
          aria-label="Next"
          data-test-id="lightbox-next"
        >
          ›
        </button>
      </div>

      <div className={style.thumbs}>
        {photos.map((photoKey, i) => (
          <LightboxThumbnail
            key={photoKey}
            photoKey={photoKey}
            index={i}
            active={i === index}
            onSelect={onIndex}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
}

Lightbox.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.string).isRequired,
  index: PropTypes.number.isRequired,
  onIndex: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  alt: PropTypes.string,
};
