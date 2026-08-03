import React from 'react';
import PropTypes from 'prop-types';
import * as style from './content.module.scss';

// Maps an amenity name to a glyph by keyword. Falls back to a dot so an unknown
// amenity still lines up in the grid.
const ICONS = [
  [/wi-?fi|internet/i, '📶'],
  [/pool/i, '🏊'],
  [/kitchen/i, '🍳'],
  [/parking/i, '🅿️'],
  [/air ?con|a\/c|cooling/i, '❄️'],
  [/heat/i, '🔥'],
  [/washer|laundry/i, '🧺'],
  [/tv|television/i, '📺'],
  [/pet/i, '🐾'],
  [/gym|fitness/i, '🏋️'],
  [/hot ?tub|spa/i, '🛁'],
  [/beach|ocean|sea/i, '🏖️'],
  [/workspace|desk|office/i, '💻'],
];

function glyphFor(name) {
  const match = ICONS.find(([pattern]) => pattern.test(name));
  return match ? match[1] : '•';
}

export default function AmenityIcon({ name }) {
  return (
    <span className={style.amenityIcon} aria-hidden="true">
      {glyphFor(name)}
    </span>
  );
}

AmenityIcon.propTypes = {
  name: PropTypes.string.isRequired,
};
