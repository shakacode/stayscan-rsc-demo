import React from 'react';
import PropTypes from 'prop-types';
import Testimonials from './Testimonials';
import HostsPitch from './HostsPitch';
import CmsBlock from './CmsBlock';

// The below-the-fold sections, bundled into one code-split chunk loaded via
// @loadable/component from the Welcome page.
export default function BelowFold({ testimonials, cms }) {
  return (
    <>
      <Testimonials testimonials={testimonials} />
      <HostsPitch />
      <CmsBlock cms={cms} />
    </>
  );
}

BelowFold.propTypes = {
  testimonials: PropTypes.arrayOf(PropTypes.object),
  cms: PropTypes.shape({ title: PropTypes.string, body: PropTypes.string }),
};
