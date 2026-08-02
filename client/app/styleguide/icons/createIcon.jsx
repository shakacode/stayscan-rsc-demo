import React from 'react';
import PropTypes from 'prop-types';

// Factory for consistent line icons: 24x24 grid, currentColor stroke, decorative
// by default (aria-hidden) or labelled when a `title` is passed. `shapes` is an
// array of [tag, attrs] tuples so icon files stay pure data (no JSX).
export default function createIcon(name, shapes, viewBox = '0 0 24 24') {
  function Icon({ size = 20, title, className, ...rest }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        role={title ? 'img' : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        {...rest}
      >
        {title && <title>{title}</title>}
        {shapes.map(([tag, attrs], index) => React.createElement(tag, { key: index, ...attrs }))}
      </svg>
    );
  }
  Icon.displayName = name;
  Icon.propTypes = {
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
    className: PropTypes.string,
  };
  return Icon;
}
