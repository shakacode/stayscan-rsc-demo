import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import SectionHeading from './SectionHeading';
import AmenityItem from './AmenityItem';
import * as style from './content.module.scss';

const PREVIEW_COUNT = 8;

// The amenities section: a preview grid plus a "show all" that opens the full
// amenities modal (owned by the parent).
export default function AmenitiesGrid({ amenities, onShowAll }) {
  if (!amenities || amenities.length === 0) return null;

  const preview = amenities.slice(0, PREVIEW_COUNT);
  const hasMore = amenities.length > PREVIEW_COUNT;

  return (
    <section className={style.section} data-test-id="amenities-section">
      <SectionHeading titleId="listingDetail.amenities.title" />
      <div className={style.amenitiesGrid}>
        {preview.map((name) => (
          <AmenityItem key={name} name={name} />
        ))}
      </div>
      {hasMore && (
        <Button
          variant="secondary"
          size="sm"
          className={style.readMoreButton}
          onClick={onShowAll}
          data-test-id="show-all-amenities"
        >
          <FormattedMessage
            id="listingDetail.amenities.showAll"
            values={{ count: amenities.length }}
          />
        </Button>
      )}
    </section>
  );
}

AmenitiesGrid.propTypes = {
  amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
  onShowAll: PropTypes.func.isRequired,
};
