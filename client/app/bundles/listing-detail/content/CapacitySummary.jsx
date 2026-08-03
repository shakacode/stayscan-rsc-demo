import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './content.module.scss';

// The "2 bedrooms · 2 baths · sleeps 4" summary line under the title.
const FIELDS = [
  { key: 'maxGuests', id: 'listingDetail.capacity.guests' },
  { key: 'bedrooms', id: 'listingDetail.capacity.bedrooms' },
  { key: 'beds', id: 'listingDetail.capacity.beds' },
  { key: 'bathrooms', id: 'listingDetail.capacity.bathrooms' },
];

export default function CapacitySummary({ capacity }) {
  return (
    <ul className={style.capacity} data-test-id="capacity-summary">
      {FIELDS.filter((field) => capacity[field.key] != null).map((field) => (
        <li key={field.key}>
          <FormattedMessage id={field.id} values={{ count: capacity[field.key] }} />
        </li>
      ))}
    </ul>
  );
}

CapacitySummary.propTypes = {
  capacity: PropTypes.shape({
    bedrooms: PropTypes.number,
    bathrooms: PropTypes.number,
    beds: PropTypes.number,
    maxGuests: PropTypes.number,
  }).isRequired,
};
