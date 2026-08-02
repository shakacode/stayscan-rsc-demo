import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import FilterGroup from './FilterGroup';
import * as style from './filters.module.scss';

const OPTIONS = [null, 3.5, 4, 4.5];

// Minimum guest rating group.
export default function RatingGroup({ minRating, onChange }) {
  const intl = useIntl();

  return (
    <FilterGroup name="rating" titleId="browse.filters.rating">
      <select
        className={style.select}
        value={minRating ?? ''}
        onChange={(event) =>
          onChange({ minRating: event.target.value === '' ? null : Number(event.target.value) })
        }
        aria-label={intl.formatMessage({ id: 'browse.filters.rating' })}
        data-test-id="filter-rating"
      >
        {OPTIONS.map((option) => (
          <option key={option ?? 'any'} value={option ?? ''}>
            {option == null
              ? intl.formatMessage({ id: 'browse.filters.anyRating' })
              : intl.formatMessage({ id: 'browse.filters.ratingPlus' }, { rating: option })}
          </option>
        ))}
      </select>
    </FilterGroup>
  );
}

RatingGroup.propTypes = {
  minRating: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};
