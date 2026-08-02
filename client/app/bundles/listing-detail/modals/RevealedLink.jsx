import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './modals.module.scss';

// The revealed book-direct destination — a crawlable link the guest opens after
// confirming (reveal flow).
export default function RevealedLink({ url }) {
  return (
    <div className={style.revealedLink} data-test-id="revealed-link">
      <p className={style.muted}>
        <FormattedMessage id="listingDetail.reveal.linkLabel" />
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    </div>
  );
}

RevealedLink.propTypes = {
  url: PropTypes.string.isRequired,
};
