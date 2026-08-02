import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import cx from '../../../styleguide/cx';
import { selectPage } from '../selectors/browseSelectors';
import {
  selectTotalPages,
  selectCanNextPage,
  selectCanPrevPage,
  selectPageCapReached,
  selectPageWindow,
} from '../selectors/paginationSelectors';
import { pageChanged } from '../actions';
import * as style from './grid.module.scss';

// Paginator surfacing the 6-page anti-scraping cap. The saga refetches on page
// change; when the cap is hit, a note explains why there's no page 7.
export default function Pagination() {
  const dispatch = useDispatch();
  const page = useSelector(selectPage);
  const totalPages = useSelector(selectTotalPages);
  const canPrev = useSelector(selectCanPrevPage);
  const canNext = useSelector(selectCanNextPage);
  const capReached = useSelector(selectPageCapReached);
  const window = useSelector(selectPageWindow);

  if (totalPages <= 1) return null;

  return (
    <nav className={style.pagination} aria-label="Pagination" data-test-id="pagination">
      <button
        type="button"
        className={style.pageButton}
        disabled={!canPrev}
        onClick={() => dispatch(pageChanged(page - 1))}
        data-test-id="page-prev"
      >
        <FormattedMessage id="browse.page.prev" />
      </button>

      {window.map((n) => (
        <button
          key={n}
          type="button"
          className={cx(style.pageButton, n === page && style.pageButtonActive)}
          aria-current={n === page ? 'page' : undefined}
          onClick={() => dispatch(pageChanged(n))}
          data-test-id={`page-${n}`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        className={style.pageButton}
        disabled={!canNext}
        onClick={() => dispatch(pageChanged(page + 1))}
        data-test-id="page-next"
      >
        <FormattedMessage id="browse.page.next" />
      </button>

      {capReached && (
        <p className={style.capNote} data-test-id="page-cap-note">
          <FormattedMessage id="browse.page.cap" values={{ pages: totalPages }} />
        </p>
      )}
    </nav>
  );
}
