import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import FilterGroup from './FilterGroup';
import * as style from './filters.module.scss';

// Min/max nightly-price group. Empty input = no bound. Committed onChange (blur/
// enter) so a live count preview doesn't fire on every keystroke.
export default function PriceRangeGroup({ minPrice, maxPrice, bounds, onChange }) {
  const intl = useIntl();
  const toValue = (raw) => (raw === '' ? null : Number(raw));

  return (
    <FilterGroup name="price" titleId="browse.filters.price">
      <div className={style.priceInputs} data-test-id="filter-price">
        <input
          type="number"
          className={style.priceInput}
          min={bounds.min}
          max={bounds.max}
          defaultValue={minPrice ?? ''}
          aria-label={intl.formatMessage({ id: 'browse.filters.minPrice' })}
          onChange={(event) => onChange({ minPrice: toValue(event.target.value) })}
          data-test-id="filter-min-price"
        />
        <span aria-hidden="true">–</span>
        <input
          type="number"
          className={style.priceInput}
          min={bounds.min}
          max={bounds.max}
          defaultValue={maxPrice ?? ''}
          aria-label={intl.formatMessage({ id: 'browse.filters.maxPrice' })}
          onChange={(event) => onChange({ maxPrice: toValue(event.target.value) })}
          data-test-id="filter-max-price"
        />
      </div>
    </FilterGroup>
  );
}

PriceRangeGroup.propTypes = {
  minPrice: PropTypes.number,
  maxPrice: PropTypes.number,
  bounds: PropTypes.shape({ min: PropTypes.number, max: PropTypes.number }).isRequired,
  onChange: PropTypes.func.isRequired,
};
