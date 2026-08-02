import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './content.module.scss';

// Opens the share/price-share modal.
export default function ShareButton({ onShare }) {
  return (
    <button
      type="button"
      className={style.iconButton}
      onClick={onShare}
      data-test-id="share-listing"
    >
      <span aria-hidden="true">↗</span>
      <FormattedMessage id="listingDetail.actions.share" />
    </button>
  );
}

ShareButton.propTypes = {
  onShare: PropTypes.func.isRequired,
};
