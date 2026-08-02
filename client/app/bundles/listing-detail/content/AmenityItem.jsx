import React from 'react';
import PropTypes from 'prop-types';
import AmenityIcon from './AmenityIcon';
import * as style from './content.module.scss';

// Icon + label for a single amenity, shared by the grid and the amenities modal.
export default function AmenityItem({ name }) {
  return (
    <div className={style.amenity}>
      <AmenityIcon name={name} />
      <span>{name}</span>
    </div>
  );
}

AmenityItem.propTypes = {
  name: PropTypes.string.isRequired,
};
