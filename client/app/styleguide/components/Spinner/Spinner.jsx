import React from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Spinner.module.scss';

// Indeterminate loading spinner.
export default function Spinner({ size = 20, label = 'Loading', className }) {
  return (
    <span
      className={cx(style.spinner, className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  label: PropTypes.string,
  className: PropTypes.string,
};
