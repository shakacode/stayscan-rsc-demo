import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SectionHeading from './SectionHeading';
import LocationMap from './LocationMap';
import * as style from './content.module.scss';

// "Where you'll be" — the approximate-area map plus the privacy disclaimer and
// the city label (never the street address).
export default function LocationSection({ coordinates, city }) {
  if (!coordinates) return null;

  return (
    <section className={style.section} data-test-id="location-section">
      <SectionHeading titleId="listingDetail.location.title" />
      <LocationMap coordinates={coordinates} />
      <p className={style.mapNote}>
        {city && <strong>{city}. </strong>}
        <FormattedMessage id="listingDetail.location.approximate" />
      </p>
    </section>
  );
}

LocationSection.propTypes = {
  coordinates: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  city: PropTypes.string,
};
