import React from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { selectMeta } from '../selectors/browseSelectors';
import { selectVisibleCount } from '../selectors/resultSelectors';
import SortDropdown from './SortDropdown';
import FiltersButton from '../filters/FiltersButton';
import * as style from './grid.module.scss';

// Above the grid: how many of the total are shown, the filters button, and sort.
export default function ResultsToolbar() {
  const meta = useSelector(selectMeta);
  const visible = useSelector(selectVisibleCount);

  return (
    <div className={style.toolbar} data-test-id="results-toolbar">
      <span>
        <FormattedMessage
          id="browse.toolbar.showing"
          values={{ visible, total: meta.totalCount }}
        />
      </span>
      <span className={style.toolbarActions}>
        <FiltersButton />
        <SortDropdown />
      </span>
    </div>
  );
}
