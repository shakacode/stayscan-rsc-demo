import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from './SectionHeading';
import HostCard from './HostCard';
import HostUnknown from './HostUnknown';
import * as style from './content.module.scss';

// "Your host" — the known/unknown split from the host block.
export default function HostSection({ host, onContact }) {
  return (
    <section className={style.section} data-test-id="host-section">
      <SectionHeading titleId="listingDetail.host.title" />
      {host.known ? (
        <HostCard host={host} onContact={onContact} />
      ) : (
        <HostUnknown onContact={onContact} />
      )}
    </section>
  );
}

HostSection.propTypes = {
  host: PropTypes.shape({ known: PropTypes.bool }).isRequired,
  onContact: PropTypes.func.isRequired,
};
