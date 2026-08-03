import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import I18nProvider from './i18n/I18nProvider';

// The provider stack every page wraps its content in: the shared layout redux
// store + react-intl. Kept separate from the page components so each bundle
// composes it the same way.
export default function LayoutProviders({ store, locale = 'en', messages, children }) {
  return (
    <Provider store={store}>
      <I18nProvider locale={locale} messages={messages}>
        {children}
      </I18nProvider>
    </Provider>
  );
}

LayoutProviders.propTypes = {
  store: PropTypes.object.isRequired,
  locale: PropTypes.string,
  messages: PropTypes.objectOf(PropTypes.string).isRequired,
  children: PropTypes.node,
};
