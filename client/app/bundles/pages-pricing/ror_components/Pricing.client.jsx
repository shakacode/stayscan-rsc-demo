import React from 'react';
import PropTypes from 'prop-types';
import MarketingPage from '../../marketing/MarketingPage';
import PricingTable from '../../marketing/components/PricingTable';
import messages from '../i18n/en.json';

export default function Pricing({ layout, premiumPrice, businessPrice, locale = 'en' }) {
  return (
    <MarketingPage layout={layout} locale={locale} messages={messages}>
      <PricingTable premiumPrice={premiumPrice} businessPrice={businessPrice} />
    </MarketingPage>
  );
}

Pricing.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  premiumPrice: PropTypes.number,
  businessPrice: PropTypes.number,
  locale: PropTypes.string,
};
