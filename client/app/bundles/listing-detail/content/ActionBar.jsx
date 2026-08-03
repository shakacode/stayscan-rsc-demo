import React from 'react';
import PropTypes from 'prop-types';
import SaveToTripButton from './SaveToTripButton';
import ShareButton from './ShareButton';
import PriceAlertSubscribe from './PriceAlertSubscribe';
import * as style from './content.module.scss';

// The row of secondary actions under the title: save, share, price alert.
export default function ActionBar({ saved, onSave, onShare, onPriceAlert }) {
  return (
    <div className={style.actionBar} data-test-id="action-bar">
      <SaveToTripButton saved={saved} onToggle={onSave} />
      <ShareButton onShare={onShare} />
      <PriceAlertSubscribe onSubscribe={onPriceAlert} />
    </div>
  );
}

ActionBar.propTypes = {
  saved: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onPriceAlert: PropTypes.func.isRequired,
};
