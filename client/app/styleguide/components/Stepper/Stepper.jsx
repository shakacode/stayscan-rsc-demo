import React, { useId } from 'react';
import PropTypes from 'prop-types';
import * as style from './Stepper.module.scss';

// Numeric stepper (guests, bedrooms). Clamps to [min, max] and disables the
// bounding control. Caller owns `value`.
export default function Stepper({ value, min = 0, max = Infinity, step = 1, onChange, label, id }) {
  const autoId = useId();
  const labelId = id ?? autoId;
  const set = (next) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div className={style.stepper}>
      {label && (
        <span id={labelId} className={style.label}>
          {label}
        </span>
      )}
      <div className={style.controls} role="group" aria-labelledby={label ? labelId : undefined}>
        <button
          type="button"
          className={style.button}
          aria-label="Decrease"
          disabled={value <= min}
          onClick={() => set(value - step)}
        >
          &minus;
        </button>
        <span className={style.value} aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className={style.button}
          aria-label="Increase"
          disabled={value >= max}
          onClick={() => set(value + step)}
        >
          +
        </button>
      </div>
    </div>
  );
}

Stepper.propTypes = {
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  id: PropTypes.string,
};
