import React from 'react';
import PropTypes from 'prop-types';
import usePageStore from '../layout/store/usePageStore';
import LayoutProviders from '../layout/LayoutProviders';
import LayoutShell from '../layout/LayoutShell';
import buildCatalogs from './i18n/catalogs';

// Shared chrome + providers for every marketing/legal page, so each page bundle
// is a thin entry around its content.
export default function MarketingPage({ layout, locale = 'en', messages = {}, children }) {
  const store = usePageStore({ layout });
  const catalogs = buildCatalogs(locale, messages);

  return (
    <LayoutProviders store={store} locale={catalogs.locale} messages={catalogs.messages}>
      <LayoutShell>
        <main>{children}</main>
      </LayoutShell>
    </LayoutProviders>
  );
}

MarketingPage.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
  messages: PropTypes.objectOf(PropTypes.string),
  children: PropTypes.node,
};
