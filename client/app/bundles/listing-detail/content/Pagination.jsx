import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import * as style from './content.module.scss';

// Prev / page-of / next pager, reused by any paged section (reviews today).
export default function Pagination({ page, perPage, total, loading, onPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;

  return (
    <div className={style.pagination} data-test-id="pagination">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1 || loading}
        onClick={() => onPage(page - 1)}
      >
        <FormattedMessage id="listingDetail.pagination.prev" />
      </Button>
      <span>
        <FormattedMessage id="listingDetail.pagination.status" values={{ page, pages }} />
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={page >= pages || loading}
        loading={loading}
        onClick={() => onPage(page + 1)}
        data-test-id="pagination-next"
      >
        <FormattedMessage id="listingDetail.pagination.next" />
      </Button>
    </div>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  onPage: PropTypes.func.isRequired,
};
