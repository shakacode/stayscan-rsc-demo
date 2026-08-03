import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';

// "Contact host" / "Message host" button. Opens the message-host modal via the
// parent; logged-out users are routed to auth first (parent decides).
export default function HostContactCta({ onContact }) {
  return (
    <Button variant="secondary" size="sm" onClick={onContact} data-test-id="contact-host">
      <FormattedMessage id="listingDetail.host.contact" />
    </Button>
  );
}

HostContactCta.propTypes = {
  onContact: PropTypes.func.isRequired,
};
