import React from 'react';
import PropTypes from 'prop-types';
import cx from '../../../styleguide/cx';
import * as style from './modals.module.scss';

// Numbered progress dots shared by the multi-step modals (inquiry, negotiation).
export default function StepIndicator({ total, current }) {
  return (
    <div className={style.stepIndicator} aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (unused, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className={cx(
            style.stepDot,
            index === current && style.stepDotActive,
            index < current && style.stepDotDone,
          )}
        >
          {index + 1}
        </span>
      ))}
    </div>
  );
}

StepIndicator.propTypes = {
  total: PropTypes.number.isRequired,
  current: PropTypes.number.isRequired,
};
