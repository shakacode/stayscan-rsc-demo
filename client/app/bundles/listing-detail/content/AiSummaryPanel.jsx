import React from 'react';
import PropTypes from 'prop-types';
import * as style from './content.module.scss';

// The body of one AI tab. Plain text from the listing's JSONB AI content.
export default function AiSummaryPanel({ text }) {
  if (!text) return null;

  return (
    <div className={style.aiPanel} data-test-id="ai-summary-panel">
      {text}
    </div>
  );
}

AiSummaryPanel.propTypes = {
  text: PropTypes.string,
};
