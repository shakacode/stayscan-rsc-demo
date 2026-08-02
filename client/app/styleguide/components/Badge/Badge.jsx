import React from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Badge.module.scss';

// Small status/label chip (e.g. "Book direct", "Top rated").
export default function Badge({ variant = 'neutral', className, children }) {
  return <span className={cx(style.badge, style[variant], className)}>{children}</span>;
}

Badge.propTypes = {
  variant: PropTypes.oneOf(['neutral', 'success', 'accent', 'outline']),
  className: PropTypes.string,
  children: PropTypes.node,
};
