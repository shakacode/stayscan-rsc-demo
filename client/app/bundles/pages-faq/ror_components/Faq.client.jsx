import React from 'react';
import PropTypes from 'prop-types';
import MarketingPage from '../../marketing/MarketingPage';
import FaqAccordion from '../../marketing/components/FaqAccordion';
import messages from '../i18n/en.json';

export default function Faq({ layout, faqs, locale = 'en' }) {
  return (
    <MarketingPage layout={layout} locale={locale} messages={messages}>
      <FaqAccordion faqs={faqs} />
    </MarketingPage>
  );
}

Faq.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  faqs: PropTypes.array,
  locale: PropTypes.string,
};
