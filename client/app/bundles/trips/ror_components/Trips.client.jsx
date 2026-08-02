import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import usePageStore from '../../layout/store/usePageStore';
import LayoutProviders from '../../layout/LayoutProviders';
import LayoutShell from '../../layout/LayoutShell';
import layoutEn from '../../layout/i18n/en.json';
import tripsEn from '../i18n/en.json';
import ListingCard from '../../../styleguide/components/ListingCard/ListingCard';
import * as style from './Trips.module.scss';

const CATALOGS = { en: { ...layoutEn, ...tripsEn } };

// The signed-in traveler's saved trip lists.
export default function Trips({ trips, layout, locale = 'en' }) {
  const store = usePageStore({ layout });

  return (
    <LayoutProviders store={store} locale={locale} messages={CATALOGS[locale] ?? CATALOGS.en}>
      <LayoutShell>
        <main className={style.page} data-test-id="trips-page">
          <h1 className={style.title}>
            <FormattedMessage id="trips.title" />
          </h1>

          {trips.lists.length === 0 ? (
            <p className={style.empty} data-test-id="trips-empty">
              <FormattedMessage id="trips.empty" />
            </p>
          ) : (
            trips.lists.map((list) => (
              <section key={list.id} className={style.list} data-test-id="trip-list">
                <h2 className={style.listName}>{list.name}</h2>
                {list.listings.length === 0 ? (
                  <p className={style.empty}>
                    <FormattedMessage id="trips.listEmpty" />
                  </p>
                ) : (
                  <div className={style.grid}>
                    {list.listings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </main>
      </LayoutShell>
    </LayoutProviders>
  );
}

Trips.propTypes = {
  trips: PropTypes.shape({ lists: PropTypes.arrayOf(PropTypes.object) }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
};
