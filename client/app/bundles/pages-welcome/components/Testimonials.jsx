import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Carousel from '../../../styleguide/components/Carousel/Carousel';
import * as style from './sections.module.scss';

export default function Testimonials({ testimonials }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className={style.section}>
      <h2 className={style.sectionTitle}>
        <FormattedMessage id="welcome.testimonials.title" />
      </h2>
      <Carousel
        items={testimonials}
        ariaLabel="Traveler testimonials"
        renderItem={(item) => (
          <blockquote className={style.testimonial}>
            <p className={style.quote}>&ldquo;{item.quote}&rdquo;</p>
            <footer className={style.attribution}>
              {item.author} &middot; {item.location}
            </footer>
          </blockquote>
        )}
      />
    </section>
  );
}

Testimonials.propTypes = {
  testimonials: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, quote: PropTypes.string, author: PropTypes.string }),
  ),
};
