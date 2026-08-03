import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import cx from '../../../styleguide/cx';
import { selectCurrentUser } from '../../layout/selectors/layoutSelectors';
import { openAuthModal } from '../../layout/reducers/authenticationModalReducer';
import * as style from './tile.module.scss';

// Save-to-trip heart. Anonymous guests are routed to the auth modal; signed-in
// guests toggle locally (persistence lands with the trip-list feature).
export default function TileSaveButton({ listingId, compact }) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [saved, setSaved] = useState(false);

  const toggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      dispatch(openAuthModal('signIn'));
      return;
    }
    setSaved((value) => !value);
  };

  return (
    <button
      type="button"
      className={cx(style.iconButton, saved && style.iconButtonActive)}
      aria-pressed={saved}
      onClick={toggle}
      data-test-id={`tile-save-${listingId}`}
    >
      <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
      {!compact && <FormattedMessage id={saved ? 'browse.tile.saved' : 'browse.tile.save'} />}
    </button>
  );
}

TileSaveButton.propTypes = {
  listingId: PropTypes.number.isRequired,
  compact: PropTypes.bool,
};
