import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Stepper from '../../../styleguide/components/Stepper/Stepper';
import FilterGroup from './FilterGroup';
import * as style from './filters.module.scss';

// A "minimum N" stepper group (bedrooms / bathrooms / guests). null = no minimum.
export default function StepperGroup({ name, titleId, value, max, onChange }) {
  return (
    <FilterGroup name={name} titleId={titleId}>
      <div className={style.groupRow}>
        <span>
          <FormattedMessage id="browse.filters.anyMin" values={{ value: value ?? 0 }} />
        </span>
        <Stepper
          value={value ?? 0}
          min={0}
          max={max}
          onChange={(next) => onChange(next === 0 ? null : next)}
        />
      </div>
    </FilterGroup>
  );
}

StepperGroup.propTypes = {
  name: PropTypes.string.isRequired,
  titleId: PropTypes.string.isRequired,
  value: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};
