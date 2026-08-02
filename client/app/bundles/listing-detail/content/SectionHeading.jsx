import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './content.module.scss';

// Shared heading row every listing-detail view section uses: a translated title with an optional
// trailing action (e.g. "Show all reviews").
export default function SectionHeading({ titleId, values, action }) {
  return (
    <div className={style.sectionHeading}>
      <h2 className={style.sectionTitle}>
        <FormattedMessage id={titleId} values={values} />
      </h2>
      {action}
    </div>
  );
}

SectionHeading.propTypes = {
  titleId: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object,
  action: PropTypes.node,
};
