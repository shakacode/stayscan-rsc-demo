import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PhotoTile from './PhotoTile';
import GalleryButton from './GalleryButton';
import Lightbox from './Lightbox';
import * as style from './content.module.scss';

const GRID_TILES = 5;

// The photo hero + grid with a lightbox. Owns the open/index state; the tiles and
// the "show all" button open it, the Lightbox handles navigation.
export default function PhotoGallery({ photos, title }) {
  const [openAt, setOpenAt] = useState(null);
  if (!photos || photos.length === 0) return null;

  const grid = photos.slice(0, GRID_TILES);

  return (
    <section data-test-id="photo-gallery">
      <div className={style.gallery}>
        {grid.map((photoKey, index) => (
          <PhotoTile
            key={photoKey}
            photoKey={photoKey}
            index={index}
            hero={index === 0}
            size={index === 0 ? 'hero' : 'tile'}
            alt={`${title} — photo ${index + 1}`}
            onOpen={setOpenAt}
          />
        ))}
        <GalleryButton count={photos.length} onOpen={setOpenAt} />
      </div>

      {openAt != null && (
        <Lightbox
          photos={photos}
          index={openAt}
          onIndex={setOpenAt}
          onClose={() => setOpenAt(null)}
          alt={title}
        />
      )}
    </section>
  );
}

PhotoGallery.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string,
};
