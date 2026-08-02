import React from 'react';
import PropTypes from 'prop-types';
import MarketingPage from '../../marketing/MarketingPage';
import ContactForm from '../../marketing/components/ContactForm';
import messages from '../i18n/en.json';

export default function Contact({ layout, locale = 'en' }) {
  return (
    <MarketingPage layout={layout} locale={locale} messages={messages}>
      <ContactForm />
    </MarketingPage>
  );
}

Contact.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
};
