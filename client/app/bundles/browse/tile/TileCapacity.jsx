import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './tile.module.scss';

// "2 bd · 2 ba · 4 guests" capacity line.
const FIELDS = [
  { key: 'bedrooms', id: 'browse.tile.beds' },
  { key: 'bathrooms', id: 'browse.tile.baths' },
  { key: 'maxGuests', id: 'browse.tile.guests' },
];

export default function TileCapacity({ capacity }) {
  return (
    <ul className={style.capacity} data-test-id="tile-capacity">
      {FIELDS.filter((field) => capacity[field.key] != null).map((field) => (
        <li key={field.key}>
          <FormattedMessage id={field.id} values={{ count: capacity[field.key] }} />
        </li>
      ))}
    </ul>
  );
}

TileCapacity.propTypes = {
  capacity: PropTypes.shape({
    bedrooms: PropTypes.number,
    bathrooms: PropTypes.number,
    maxGuests: PropTypes.number,
  }).isRequired,
};
