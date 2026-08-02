import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from '../../../styleguide/cx';
import AiSummaryPanel from './AiSummaryPanel';
import NeighborhoodPanel from './NeighborhoodPanel';
import HostHighlights from './HostHighlights';
import * as style from './content.module.scss';

// Tabbed AI content assembled from the listing's JSONB: the plain-text
// review summary, the structured neighborhood block, and the structured host
// block. Only tabs with content render; each renders its own panel type.
export default function ReviewAiTabs({ reviewsSummary, nearbyHighlights, fromTheHost }) {
  const tabs = [
    reviewsSummary && {
      key: 'summary',
      labelId: 'listingDetail.ai.summary',
      render: () => <AiSummaryPanel text={reviewsSummary} />,
    },
    nearbyHighlights && {
      key: 'neighborhood',
      labelId: 'listingDetail.ai.neighborhood',
      render: () => <NeighborhoodPanel data={nearbyHighlights} />,
    },
    fromTheHost && {
      key: 'host',
      labelId: 'listingDetail.ai.host',
      render: () => (
        <div className={style.aiPanel}>
          <HostHighlights data={fromTheHost} />
        </div>
      ),
    },
  ].filter(Boolean);

  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;

  const current = tabs[Math.min(active, tabs.length - 1)];

  return (
    <div data-test-id="review-ai-tabs">
      <div className={style.aiTabs} role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={cx(style.aiTab, index === active && style.aiTabActive)}
            onClick={() => setActive(index)}
          >
            <FormattedMessage id={tab.labelId} />
          </button>
        ))}
      </div>
      {current.render()}
    </div>
  );
}

ReviewAiTabs.propTypes = {
  reviewsSummary: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  nearbyHighlights: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  fromTheHost: PropTypes.object,
};
