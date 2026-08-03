import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import loadable from '@loadable/component';
import usePageStore from '../../layout/store/usePageStore';
import LayoutProviders from '../../layout/LayoutProviders';
import LayoutShell from '../../layout/LayoutShell';
import Button from '../../../styleguide/components/Button/Button';
import PriceComparison from '../components/PriceComparison';
import Explainer from '../components/Explainer';
import Stats from '../components/Stats';
import buildCatalogs from '../i18n/catalogs';
import * as style from './Welcome.module.scss';

// Below-the-fold sections are one code-split chunk, server-rendered too.
const BelowFold = loadable(() => import('../components/BelowFold'), { ssr: true });

function WelcomeHero() {
  return (
    <section className={style.hero}>
      <p className={style.eyebrow}>
        <FormattedMessage id="welcome.hero.eyebrow" />
      </p>
      <h1 className={style.title}>
        <FormattedMessage id="welcome.hero.title" />
      </h1>
      <p className={style.subtitle}>
        <FormattedMessage id="welcome.hero.subtitle" />
      </p>
      <Button variant="primary" size="lg">
        <FormattedMessage id="welcome.hero.cta" />
      </Button>
    </section>
  );
}

// Home page: hero + what's-cheaper + explainer + stats above the fold, then
// the loadable-split below-the-fold sections. All server-rendered through the Node
// renderer over the shared layout.
export default function Welcome({ layout, home, locale = 'en' }) {
  const store = usePageStore({ layout });
  const catalogs = buildCatalogs(locale);

  return (
    <LayoutProviders store={store} locale={catalogs.locale} messages={catalogs.messages}>
      <LayoutShell>
        <main>
          <WelcomeHero />
          {home?.example && <PriceComparison example={home.example} />}
          <Explainer />
          {home?.stats && <Stats stats={home.stats} />}
          <BelowFold testimonials={home?.testimonials} cms={home?.cms} />
        </main>
      </LayoutShell>
    </LayoutProviders>
  );
}

Welcome.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  home: PropTypes.object,
  locale: PropTypes.string,
};
