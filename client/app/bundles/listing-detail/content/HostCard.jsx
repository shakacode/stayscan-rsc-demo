import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Avatar from '../../../styleguide/components/Avatar/Avatar';
import Badge from '../../../styleguide/components/Badge/Badge';
import ReadMore from './ReadMore';
import HostContactCta from './HostContactCta';
import * as style from './content.module.scss';

// Known-host variant: avatar, name, verified badge, bio and the contact CTA.
export default function HostCard({ host, onContact }) {
  return (
    <div className={style.host} data-test-id="host-known">
      <Avatar name={host.name} size="lg" />
      <div className={style.hostBody}>
        <div className={style.hostName}>
          {host.name}
          {host.verified && (
            <>
              {' '}
              <Badge variant="success">
                <FormattedMessage id="listingDetail.host.verified" />
              </Badge>
            </>
          )}
        </div>
        {host.about && <ReadMore text={host.about} limit={200} />}
        <HostContactCta onContact={onContact} />
      </div>
    </div>
  );
}

HostCard.propTypes = {
  host: PropTypes.shape({
    name: PropTypes.string,
    about: PropTypes.string,
    verified: PropTypes.bool,
  }).isRequired,
  onContact: PropTypes.func.isRequired,
};
