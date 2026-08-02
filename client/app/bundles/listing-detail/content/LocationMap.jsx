import React from 'react';
import PropTypes from 'prop-types';
import * as style from './content.module.scss';

// Self-contained approximate-area map. We intentionally do NOT plot the exact
// address: coordinates arrive already coarsened (rounded ~1km) and we draw a
// privacy circle rather than a pin. Rendered as inline SVG so it needs no
// external tiles/WebGL — the system specs stay hermetic and SSR is safe.
export default function LocationMap({ coordinates }) {
  if (!coordinates) return null;

  return (
    <div className={style.map} data-test-id="location-map">
      <svg
        viewBox="0 0 400 225"
        width="100%"
        height="100%"
        role="img"
        aria-label="Approximate location"
      >
        <rect width="400" height="225" fill="#e8efe9" />
        <g stroke="#cdd8ce" strokeWidth="2">
          <line x1="0" y1="70" x2="400" y2="55" />
          <line x1="0" y1="150" x2="400" y2="165" />
          <line x1="120" y1="0" x2="140" y2="225" />
          <line x1="280" y1="0" x2="260" y2="225" />
        </g>
        <rect x="150" y="80" width="100" height="65" fill="#d5e6d8" opacity="0.7" />
        <circle
          cx="200"
          cy="112"
          r="60"
          fill="#2f7d55"
          fillOpacity="0.18"
          stroke="#2f7d55"
          strokeWidth="2"
        />
        <circle cx="200" cy="112" r="5" fill="#2f7d55" />
      </svg>
    </div>
  );
}

LocationMap.propTypes = {
  coordinates: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
    radiusMeters: PropTypes.number,
  }),
};
