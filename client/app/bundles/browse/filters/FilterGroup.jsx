import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as style from './filters.module.scss';

// Titled wrapper for one filter group in the modal.
export default function FilterGroup({ name, titleId, children }) {
  return (
    <section className={style.group} data-test-id={`filter-group-${name}`}>
      <h3 className={style.groupTitle}>
        <FormattedMessage id={titleId} />
      </h3>
      {children}
    </section>
  );
}

FilterGroup.propTypes = {
  name: PropTypes.string.isRequired,
  titleId: PropTypes.string.isRequired,
  children: PropTypes.node,
};
