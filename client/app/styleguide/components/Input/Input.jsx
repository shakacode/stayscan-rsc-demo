import React, { useId } from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Input.module.scss';

// Labelled text/number field with an inline error slot. Thin controlled wrapper —
// callers own the value and pass onChange.
const Input = React.forwardRef(function Input(
  { id, label, error, type = 'text', className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cx(style.field, className)}>
      {label && (
        <label htmlFor={inputId} className={style.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={cx(style.input, error && style.hasError)}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error && (
        <span className={style.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default Input;
