import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { selectActiveFilterCount } from '../selectors/filterSelectors';
import { filtersModalToggled } from '../actions';
import * as style from './filters.module.scss';

// Opens the filters modal; shows how many filters are currently applied.
export default function FiltersButton() {
  const dispatch = useDispatch();
  const activeCount = useSelector(selectActiveFilterCount);

  return (
    <button
      type="button"
      className={style.filtersButton}
      onClick={() => dispatch(filtersModalToggled(true))}
      data-test-id="open-filters"
    >
      <FormattedMessage id="browse.filters.title" />
      {activeCount > 0 && <span className={style.filtersBadge}>{activeCount}</span>}
    </button>
  );
}
