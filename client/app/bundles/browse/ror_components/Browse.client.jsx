import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import usePageStore from '../../layout/store/usePageStore';
import LayoutProviders from '../../layout/LayoutProviders';
import LayoutShell from '../../layout/LayoutShell';
import layoutEn from '../../layout/i18n/en.json';
import browseEn from '../i18n/en.json';
import cx from '../../../styleguide/cx';
import browseReducer from '../reducers';
import browseRootSaga from '../sagas';
import seedBrowseState from '../store/seedBrowseState';
import {
  selectSeo,
  selectMeta,
  selectLocation,
  selectMobileView,
} from '../selectors/browseSelectors';
import ResultsGrid from '../grid/ResultsGrid';
import BrowseMap from '../components/BrowseMap';
import BrowseDates from '../components/BrowseDates';
import MobileMapToggle from '../components/MobileMapToggle';
import FiltersModal from '../filters/FiltersModal';
import * as style from './Browse.module.scss';

const CATALOGS = { en: { ...layoutEn, ...browseEn } };

// browse view — the heaviest client-state page, rendered from the browse view Redux store
// (normalized entities in Immutable, memoized selectors, sagas for refetch / URL
// sync / live pricing): the full ListingTile grid + paginator + the dual-engine
// map, side by side with a mobile list/map toggle.
function BrowseContent() {
  const seo = useSelector(selectSeo);
  const meta = useSelector(selectMeta);
  const location = useSelector(selectLocation);
  const mobileView = useSelector(selectMobileView);

  return (
    <main className={style.page} data-test-id="browse-page">
      <header className={style.header}>
        {location && (
          <nav className={style.breadcrumb} aria-label="Location">
            {location.breadcrumb.map((crumb) => (
              <a key={crumb.path} href={`/l/${crumb.path}`}>
                {crumb.name}
              </a>
            ))}
          </nav>
        )}
        <h1 className={style.title}>{seo.title}</h1>
        <p className={style.count} data-test-id="results-count">
          <FormattedMessage id="browse.results.count" values={{ count: meta.totalCount }} />
          {meta.capReached && (
            <>
              {' · '}
              <FormattedMessage id="browse.results.capped" values={{ pages: meta.maxPages }} />
            </>
          )}
        </p>
        <BrowseDates />
        <MobileMapToggle />
      </header>

      <div className={style.layout} data-mobile-view={mobileView}>
        <section className={cx(style.results, mobileView === 'map' && style.hiddenMobile)}>
          <ResultsGrid />
        </section>

        <aside className={cx(style.mapPane, mobileView === 'list' && style.hiddenMobile)}>
          <BrowseMap />
        </aside>
      </div>

      <FiltersModal />
    </main>
  );
}

export default function Browse({ index, layout, locale = 'en' }) {
  const store = usePageStore({
    layout,
    pageReducers: { browse: browseReducer },
    pageState: seedBrowseState(index),
    pageSaga: browseRootSaga,
  });

  return (
    <LayoutProviders store={store} locale={locale} messages={CATALOGS[locale] ?? CATALOGS.en}>
      <LayoutShell>
        <BrowseContent />
      </LayoutShell>
    </LayoutProviders>
  );
}

Browse.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  index: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
};
