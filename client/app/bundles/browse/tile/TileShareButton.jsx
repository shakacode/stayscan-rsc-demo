import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './tile.module.scss';

// Share a listing via the native share sheet when available, else copy the link.
export default function TileShareButton({ url }) {
  const share = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const absolute = `${window.location.origin}${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ url: absolute });
      } else {
        await navigator.clipboard.writeText(absolute);
      }
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  };

  return (
    <button type="button" className={style.iconButton} onClick={share} data-test-id="tile-share">
      <span aria-hidden="true">↗</span>
      <FormattedMessage id="browse.tile.share" />
    </button>
  );
}

TileShareButton.propTypes = {
  url: PropTypes.string.isRequired,
};
