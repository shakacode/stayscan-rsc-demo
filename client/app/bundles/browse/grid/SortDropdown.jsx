import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { selectSort } from '../selectors/browseSelectors';
import { sortChanged } from '../actions';
import * as style from './grid.module.scss';

const OPTIONS = ['recommended', 'price_asc', 'price_desc', 'rating'];

// Result ordering select. Committing a sort resets to page 1 and refetches (saga).
export default function SortDropdown() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const sort = useSelector(selectSort);

  return (
    <label className={style.sort}>
      {intl.formatMessage({ id: 'browse.sort.label' })}
      <select
        className={style.select}
        value={sort}
        onChange={(event) => dispatch(sortChanged(event.target.value))}
        data-test-id="sort-dropdown"
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {intl.formatMessage({ id: `browse.sort.${option}` })}
          </option>
        ))}
      </select>
    </label>
  );
}
