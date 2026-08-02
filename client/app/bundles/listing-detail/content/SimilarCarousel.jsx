import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import Carousel from '../../../styleguide/components/Carousel/Carousel';
import SectionHeading from './SectionHeading';
import ListingTileLite from './ListingTileLite';
import * as style from './content.module.scss';

// "Similar places nearby" — the styleguide carousel over ListingTileLite cards.
export default function SimilarCarousel({ listings, currency }) {
  const intl = useIntl();
  if (!listings || listings.length === 0) return null;

  return (
    <section className={style.section} data-test-id="similar-section">
      <SectionHeading titleId="listingDetail.similar.title" />
      <Carousel
        items={listings}
        ariaLabel={intl.formatMessage({ id: 'listingDetail.similar.title' })}
        renderItem={(listing) => <ListingTileLite listing={listing} currency={currency} />}
      />
    </section>
  );
}

SimilarCarousel.propTypes = {
  listings: PropTypes.arrayOf(PropTypes.object).isRequired,
  currency: PropTypes.string,
};
