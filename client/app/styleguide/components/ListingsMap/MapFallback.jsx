import React from 'react';
import PropTypes from 'prop-types';
import * as style from './ListingsMap.module.scss';

// Shown when a WebGL engine can't initialize (e.g. headless without a GPU): the
// markers still render as interactive price pills so the page never breaks.
export default function MapFallback({ markers, hoveredId, onMarkerHover, onMarkerClick }) {
  return (
    <div className={style.fallback} data-test-id="map-fallback">
      <div className={style.fallbackList}>
        {markers.map((marker) => (
          <button
            key={marker.id}
            type="button"
            data-test-id={`map-marker-${marker.id}`}
            onMouseEnter={() => onMarkerHover(marker.id)}
            onMouseLeave={() => onMarkerHover(null)}
            onClick={() => onMarkerClick && onMarkerClick(marker.id)}
            style={{
              background: marker.id === hoveredId ? '#2f7d55' : '#fff',
              color: marker.id === hoveredId ? '#fff' : '#1a1a1a',
              border: '1px solid #2f7d55',
              borderRadius: '14px',
              padding: '2px 8px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {marker.price != null ? `$${Math.round(marker.price)}` : '—'}
          </button>
        ))}
      </div>
    </div>
  );
}

MapFallback.propTypes = {
  markers: PropTypes.arrayOf(PropTypes.object).isRequired,
  hoveredId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onMarkerHover: PropTypes.func.isRequired,
  onMarkerClick: PropTypes.func,
};
