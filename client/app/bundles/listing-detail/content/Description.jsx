import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SectionHeading from './SectionHeading';
import ReadMore from './ReadMore';
import HostHighlights from './HostHighlights';
import * as style from './content.module.scss';

// "About this place" + the host's AI blurb (structured summary + highlights).
export default function Description({ description, fromTheHost }) {
  if (!description) return null;

  return (
    <section className={style.section} data-test-id="description-section">
      <SectionHeading titleId="listingDetail.description.title" />
      <ReadMore text={description} />
      {fromTheHost && (
        <div data-test-id="from-the-host">
          <h3 className={style.sectionTitle}>
            <FormattedMessage id="listingDetail.description.fromHost" />
          </h3>
          <HostHighlights data={fromTheHost} />
        </div>
      )}
    </section>
  );
}

Description.propTypes = {
  description: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  fromTheHost: PropTypes.object,
};
