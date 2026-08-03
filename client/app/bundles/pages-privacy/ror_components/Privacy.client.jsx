import React from 'react';
import PropTypes from 'prop-types';
import MarketingPage from '../../marketing/MarketingPage';
import CmsPage from '../../marketing/components/CmsPage';

export default function Privacy({ layout, cms, locale = 'en' }) {
  return (
    <MarketingPage layout={layout} locale={locale}>
      <CmsPage cms={cms} />
    </MarketingPage>
  );
}

Privacy.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  cms: PropTypes.object,
  locale: PropTypes.string,
};
