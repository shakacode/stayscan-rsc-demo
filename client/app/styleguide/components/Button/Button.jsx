import React from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Button.module.scss';

// The one button. Renders an <a> when `href` is set (keyboard-navigable links
// over onClick+window.open), a <button> otherwise. `loading` disables + shows a
// spinner without changing width.
const Button = React.forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    href,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = cx(
    style.button,
    style[variant],
    style[size],
    fullWidth && style.fullWidth,
    loading && style.loading,
    className,
  );

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} aria-disabled={disabled || undefined} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={style.spinner} aria-hidden="true" />}
      <span className={style.label}>{children}</span>
    </button>
  );
});

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  href: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Button;
