import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Stepper from '../../../styleguide/components/Stepper/Stepper';
import * as style from './booking.module.scss';

// One labelled guest category row (adults / children / infants) wrapping the
// styleguide Stepper with a description line.
export default function GuestStepperRow({ category, value, min = 0, max, onChange }) {
  return (
    <div className={style.guestRow}>
      <span className={style.guestLabel}>
        <span className={style.guestName}>
          <FormattedMessage id={`listingDetail.guests.${category}`} />
        </span>
        <span className={style.guestHint}>
          <FormattedMessage id={`listingDetail.guests.${category}Hint`} />
        </span>
      </span>
      <Stepper value={value} min={min} max={max} onChange={onChange} />
    </div>
  );
}

GuestStepperRow.propTypes = {
  category: PropTypes.oneOf(['adults', 'children', 'infants']).isRequired,
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};
