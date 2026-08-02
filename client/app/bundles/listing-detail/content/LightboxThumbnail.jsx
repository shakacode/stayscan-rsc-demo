import React from 'react';
import PropTypes from 'prop-types';
import cx from '../../../styleguide/cx';
import { imageUrl } from '../../../libs/imageUrl';
import * as style from './content.module.scss';

// A single thumbnail in the lightbox filmstrip; active one is outlined.
export default function LightboxThumbnail({ photoKey, index, active, onSelect }) {
  return (
    <button
      type="button"
      className={cx(style.thumb, active && style.thumbActive)}
      onClick={() => onSelect(index)}
      aria-label={`Photo ${index + 1}`}
      aria-current={active || undefined}
    >
      <img className={style.tileImg} src={imageUrl(photoKey, 'thumb', 1)} alt="" />
    </button>
  );
}

LightboxThumbnail.propTypes = {
  photoKey: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  active: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};
