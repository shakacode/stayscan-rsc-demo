import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Checkbox from '../../../styleguide/components/Checkbox/Checkbox';
import FilterGroup from './FilterGroup';

// A boolean filter group (book-direct / top-rated).
export default function ToggleGroup({ name, titleId, labelId, checked, onChange }) {
  return (
    <FilterGroup name={name} titleId={titleId}>
      <Checkbox
        id={`filter-${name}`}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        label={<FormattedMessage id={labelId} />}
      />
    </FilterGroup>
  );
}

ToggleGroup.propTypes = {
  name: PropTypes.string.isRequired,
  titleId: PropTypes.string.isRequired,
  labelId: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};
