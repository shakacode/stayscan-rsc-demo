import React from 'react';
import PropTypes from 'prop-types';
import ReadMore from './ReadMore';
import * as style from './content.module.scss';

// Renders the structured "from the host" AI block: a summary (read-more) plus the
// host's highlight bullets. Shared by the description section and the host AI tab.
export default function HostHighlights({ data }) {
  if (!data) return null;

  return (
    <div data-test-id="host-highlights">
      {data.summary && <ReadMore text={data.summary} limit={220} />}
      {data.highlights && data.highlights.length > 0 && (
        <ul className={style.aiList}>
          {data.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

HostHighlights.propTypes = {
  data: PropTypes.shape({
    summary: PropTypes.string,
    highlights: PropTypes.arrayOf(PropTypes.string),
  }),
};
