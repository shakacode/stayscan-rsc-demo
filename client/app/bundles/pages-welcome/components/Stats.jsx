import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './sections.module.scss';

// Statistics band with a decorative SVG wave.
export default function Stats({ stats }) {
  const items = [
    { key: 'listings', value: stats.listings, id: 'welcome.stats.listings' },
    { key: 'destinations', value: stats.destinations, id: 'welcome.stats.destinations' },
    { key: 'providers', value: stats.providers, id: 'welcome.stats.providers' },
  ];

  return (
    <section className={style.stats} aria-label="StayScan by the numbers">
      {items.map((item) => (
        <div key={item.key} className={style.stat}>
          <div className={style.statNumber}>{item.value.toLocaleString()}</div>
          <p className={style.muted}>
            <FormattedMessage id={item.id} />
          </p>
        </div>
      ))}
    </section>
  );
}

Stats.propTypes = {
  stats: PropTypes.shape({
    listings: PropTypes.number,
    destinations: PropTypes.number,
    providers: PropTypes.number,
  }).isRequired,
};
