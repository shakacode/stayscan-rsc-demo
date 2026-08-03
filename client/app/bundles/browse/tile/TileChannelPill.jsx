import React from 'react';
import PropTypes from 'prop-types';
import cx from '../../../styleguide/cx';
import * as style from './tile.module.scss';

const LABELS = { airhive: 'Airhive', vacario: 'Vacario', lodgeo: 'Lodgeo', hostflow: 'Direct' };

// A per-channel indicator on the price row; the cheapest channel is emphasized once
// live prices land.
export default function TileChannelPill({ providerType, best }) {
  return (
    <span
      className={cx(style.channelPill, best && style.channelPillBest)}
      data-test-id={`tile-channel-${providerType}`}
    >
      {LABELS[providerType] || providerType}
    </span>
  );
}

TileChannelPill.propTypes = {
  providerType: PropTypes.string.isRequired,
  best: PropTypes.bool,
};
