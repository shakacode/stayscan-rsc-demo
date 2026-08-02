import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';

// react-intl wrapper mounted by every bundle. Missing translations surface
// as errors (system specs fail on them) so user-facing strings stay externalized.
export default function I18nProvider({ locale = 'en', messages, children }) {
  return (
    <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
      {children}
    </IntlProvider>
  );
}

I18nProvider.propTypes = {
  locale: PropTypes.string,
  messages: PropTypes.objectOf(PropTypes.string).isRequired,
  children: PropTypes.node,
};
