import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import * as style from './content.module.scss';

const DEFAULT_LIMIT = 320;

// Collapses long prose to a character budget with a Read more / Show less toggle.
// Short text renders untruncated with no button.
export default function ReadMore({ text, limit = DEFAULT_LIMIT }) {
  const [expanded, setExpanded] = useState(false);
  const needsToggle = text.length > limit;
  const shown = !needsToggle || expanded ? text : `${text.slice(0, limit).trimEnd()}…`;

  return (
    <div>
      <p className={style.prose}>{shown}</p>
      {needsToggle && (
        <Button
          variant="ghost"
          size="sm"
          className={style.readMoreButton}
          onClick={() => setExpanded((value) => !value)}
          data-test-id="read-more-toggle"
        >
          <FormattedMessage
            id={
              expanded ? 'listingDetail.description.readLess' : 'listingDetail.description.readMore'
            }
          />
        </Button>
      )}
    </div>
  );
}

ReadMore.propTypes = {
  text: PropTypes.string.isRequired,
  limit: PropTypes.number,
};
