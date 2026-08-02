import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';

// Book-direct channels hide their link behind a reveal (gating). Logged-out
// users get the sign-in prompt instead of the reveal — the parent decides which
// callback to pass.
export default function RevealDirectButton({ onReveal, onSignIn, canReveal }) {
  if (canReveal) {
    return (
      <Button variant="secondary" size="sm" onClick={onReveal}>
        <FormattedMessage id="listingDetail.row.revealAction" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={onSignIn}>
      <FormattedMessage id="listingDetail.row.signInAction" />
    </Button>
  );
}

RevealDirectButton.propTypes = {
  onReveal: PropTypes.func.isRequired,
  onSignIn: PropTypes.func.isRequired,
  canReveal: PropTypes.bool.isRequired,
};
