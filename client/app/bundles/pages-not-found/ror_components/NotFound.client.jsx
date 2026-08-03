import React from 'react';
import PropTypes from 'prop-types';
import MarketingPage from '../../marketing/MarketingPage';
import NotFoundContent from '../../marketing/components/NotFound';

export default function NotFound({ layout, locale = 'en' }) {
  return (
    <MarketingPage layout={layout} locale={locale}>
      <NotFoundContent />
    </MarketingPage>
  );
}

NotFound.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
};
