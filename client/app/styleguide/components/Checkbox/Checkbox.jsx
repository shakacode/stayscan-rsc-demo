import React, { useId } from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Checkbox.module.scss';

// Whole-row-clickable checkbox: the <label htmlFor> wraps the control + text so
// the entire row is a hit target.
export default function Checkbox({ id, label, checked, onChange, className, ...rest }) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label htmlFor={inputId} className={cx(style.row, className)}>
      <input id={inputId} type="checkbox" checked={checked} onChange={onChange} {...rest} />
      <span className={style.text}>{label}</span>
    </label>
  );
}

Checkbox.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
};
