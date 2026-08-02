import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from '../../../styleguide/cx';
import * as style from './content.module.scss';

// Save-to-trip-list heart. Controlled by the parent, which routes anonymous users
// to auth before persisting (save flow, auth + anon).
export default function SaveToTripButton({ saved, onToggle }) {
  return (
    <button
      type="button"
      className={cx(style.iconButton, saved && style.iconButtonActive)}
      aria-pressed={saved}
      onClick={onToggle}
      data-test-id="save-to-trip"
    >
      <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
      <FormattedMessage id={saved ? 'listingDetail.actions.saved' : 'listingDetail.actions.save'} />
    </button>
  );
}

SaveToTripButton.propTypes = {
  saved: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};
