import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { haversineMeters } from './distance';
import * as style from './tile.module.scss';

// Distance from the search center to the tile, formatted km/m. Hidden for a free
// search with no center.
export default function TileDistance({ center, coordinates }) {
  const meters = haversineMeters(center, coordinates);
  if (meters == null) return null;

  const value = meters >= 1000 ? (meters / 1000).toFixed(1) : meters;
  const unit = meters >= 1000 ? 'km' : 'm';

  return (
    <span className={style.distance} data-test-id="tile-distance">
      <FormattedMessage id="browse.tile.distance" values={{ value, unit }} />
    </span>
  );
}

TileDistance.propTypes = {
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  coordinates: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
};
