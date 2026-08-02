import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './content.module.scss';

// Renders the structured nearby-highlights AI block: named points of interest,
// each with a short blurb, for the neighborhood AI tab.
export default function NeighborhoodPanel({ data }) {
  if (!data || !data.items || data.items.length === 0) return null;

  return (
    <div className={style.aiPanel} data-test-id="neighborhood-panel">
      {data.near && (
        <p className={style.aiPanelIntro}>
          <FormattedMessage id="listingDetail.ai.nearIntro" values={{ area: data.near }} />
        </p>
      )}
      <ul className={style.aiList}>
        {data.items.map((item) => (
          <li key={item.name}>
            <strong>{item.name}</strong>
            {item.blurb && ` — ${item.blurb}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

NeighborhoodPanel.propTypes = {
  data: PropTypes.shape({
    near: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, blurb: PropTypes.string })),
  }),
};
