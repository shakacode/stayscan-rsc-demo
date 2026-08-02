import React from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import { filtersCleared } from '../actions';
import * as style from './grid.module.scss';

// Shown when a search returns nothing: explain + offer to clear filters (which
// refetches via the saga).
export default function EmptyState() {
  const dispatch = useDispatch();

  return (
    <div className={style.empty} data-test-id="results-empty">
      <p className={style.emptyTitle}>
        <FormattedMessage id="browse.empty.title" />
      </p>
      <p>
        <FormattedMessage id="browse.empty.body" />
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => dispatch(filtersCleared())}
        data-test-id="empty-clear"
      >
        <FormattedMessage id="browse.empty.clear" />
      </Button>
    </div>
  );
}
