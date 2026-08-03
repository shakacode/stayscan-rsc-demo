import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Avatar from '../../../styleguide/components/Avatar/Avatar';
import HostContactCta from './HostContactCta';
import * as style from './content.module.scss';

// Unknown-host variant: no bio yet (aggregated OTA listing), so we show a generic
// block and still let the guest reach out.
export default function HostUnknown({ onContact }) {
  return (
    <div className={style.host} data-test-id="host-unknown">
      <Avatar name="" size="lg" />
      <div className={style.hostBody}>
        <div className={style.hostName}>
          <FormattedMessage id="listingDetail.host.unknownName" />
        </div>
        <p className={style.hostAbout}>
          <FormattedMessage id="listingDetail.host.unknownAbout" />
        </p>
        <HostContactCta onContact={onContact} />
      </div>
    </div>
  );
}

HostUnknown.propTypes = {
  onContact: PropTypes.func.isRequired,
};
