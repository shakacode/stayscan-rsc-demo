import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from '../../../styleguide/cx';
import Rating from '../../../styleguide/components/Rating/Rating';
import Badge from '../../../styleguide/components/Badge/Badge';
import * as style from './sections.module.scss';

// The "what's cheaper" proof: one real listing priced across its channels.
export default function PriceComparison({ example }) {
  const intl = useIntl();
  if (!example || example.channels.length === 0) return null;

  return (
    <section className={style.section}>
      <h2 className={style.sectionTitle}>
        <FormattedMessage id="welcome.cheaper.title" />
      </h2>
      <div className={style.cheaperCard}>
        <div className={style.cheaperPhoto} aria-hidden="true" />
        <div>
          <h3>{example.title}</h3>
          <p className={style.muted}>{example.city}</p>
          {example.rating != null && (
            <Rating
              value={example.rating}
              label={intl.formatMessage(
                { id: 'welcome.cheaper.reviews' },
                { count: example.reviewsCount },
              )}
            />
          )}
          <ul className={style.priceList}>
            {example.channels.map((channel) => {
              const cheapest = channel.provider === example.cheapestProvider;
              return (
                <li
                  key={channel.provider}
                  className={cx(style.priceRow, cheapest && style.cheapest)}
                >
                  <span>{channel.provider}</span>
                  <span className={style.price}>
                    <FormattedMessage
                      id="welcome.cheaper.perNight"
                      values={{ price: `$${channel.nightlyFrom}` }}
                    />
                  </span>
                  {cheapest && (
                    <Badge variant="success">
                      <FormattedMessage id="welcome.cheaper.cheapest" />
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
          {example.savings > 0 && (
            <p className={style.savings}>
              <FormattedMessage
                id="welcome.cheaper.savings"
                values={{ amount: `$${example.savings}`, provider: example.cheapestProvider }}
              />
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

PriceComparison.propTypes = {
  example: PropTypes.shape({
    title: PropTypes.string,
    city: PropTypes.string,
    rating: PropTypes.number,
    reviewsCount: PropTypes.number,
    cheapestProvider: PropTypes.string,
    savings: PropTypes.number,
    channels: PropTypes.arrayOf(
      PropTypes.shape({ provider: PropTypes.string, nightlyFrom: PropTypes.number }),
    ),
  }),
};
