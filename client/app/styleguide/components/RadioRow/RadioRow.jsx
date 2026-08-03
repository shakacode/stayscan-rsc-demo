import React, { useId } from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './RadioRow.module.scss';

// Whole-row-clickable radio option. Padding lives on the label text, not the
// input, per the styleguide radio spacing pattern.
export default function RadioRow({ id, name, value, label, checked, onChange, className }) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label htmlFor={inputId} className={cx(style.row, className)}>
      <input
        id={inputId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className={style.text}>{label}</span>
    </label>
  );
}

RadioRow.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
};
