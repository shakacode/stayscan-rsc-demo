import React, { useId, useState } from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Tooltip.module.scss';

// Hover/focus tooltip. Wraps a single interactive child and describes it via
// aria-describedby for keyboard + screen-reader users.
export default function Tooltip({ label, placement = 'top', children }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className={style.wrap}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {React.cloneElement(React.Children.only(children), { 'aria-describedby': id })}
      <span
        role="tooltip"
        id={id}
        className={cx(style.bubble, style[placement], visible && style.visible)}
      >
        {label}
      </span>
    </span>
  );
}

Tooltip.propTypes = {
  label: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom']),
  children: PropTypes.element.isRequired,
};
