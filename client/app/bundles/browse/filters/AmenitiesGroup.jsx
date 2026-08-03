import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../../../styleguide/components/Checkbox/Checkbox';
import FilterGroup from './FilterGroup';
import * as style from './filters.module.scss';

// Amenity checkbox grid → amenity ids (the backend AND-matches them into an
// amenity bitmask over the projection).
export default function AmenitiesGroup({ amenities, selectedIds, onChange }) {
  const toggle = (id, checked) => {
    const next = checked ? [...selectedIds, id] : selectedIds.filter((existing) => existing !== id);
    onChange({ amenityIds: next });
  };

  return (
    <FilterGroup name="amenities" titleId="browse.filters.amenities">
      <div className={style.amenityGrid} data-test-id="filter-amenities">
        {amenities.map((amenity) => (
          <Checkbox
            key={amenity.id}
            id={`filter-amenity-${amenity.id}`}
            checked={selectedIds.includes(amenity.id)}
            onChange={(event) => toggle(amenity.id, event.target.checked)}
            label={amenity.name}
          />
        ))}
      </div>
    </FilterGroup>
  );
}

AmenitiesGroup.propTypes = {
  amenities: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
};
