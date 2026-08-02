import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { setQuery, setActiveIndex } from '../../reducers/autocompleteReducer';
import { selectAutocomplete } from '../../selectors/layoutSelectors';
import cx from '../../../../styleguide/cx';
import SearchIcon from '../../../../styleguide/icons/SearchIcon';
import * as style from './DestinationAutocomplete.module.scss';

const OPTION_ID = (index) => `destination-option-${index}`;

// Combobox over the matview-backed destinations. Typing dispatches setQuery
// (autocompleteSaga debounces + fetches); Arrow/Enter drive keyboard selection.
export default function DestinationAutocomplete({ onSelect }) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { query, results, activeIndex } = useSelector(selectAutocomplete);
  const open = results.length > 0;

  const choose = (index) => {
    const picked = results[index];
    if (picked) onSelect(picked);
  };

  const onKeyDown = (event) => {
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      dispatch(setActiveIndex(Math.min(activeIndex + 1, results.length - 1)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      dispatch(setActiveIndex(Math.max(activeIndex - 1, 0)));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(activeIndex >= 0 ? activeIndex : 0);
    }
  };

  return (
    <div className={style.field}>
      <SearchIcon className={style.icon} />
      <input
        type="text"
        className={style.input}
        role="combobox"
        aria-expanded={open}
        aria-controls="destination-listbox"
        aria-autocomplete="list"
        aria-activedescendant={open && activeIndex >= 0 ? OPTION_ID(activeIndex) : undefined}
        placeholder={intl.formatMessage({ id: 'layout.navbar.searchPlaceholder' })}
        value={query}
        onChange={(event) => dispatch(setQuery(event.target.value))}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul id="destination-listbox" role="listbox" className={style.list}>
          {results.map((result, index) => (
            <li
              key={result.id}
              id={OPTION_ID(index)}
              role="option"
              aria-selected={index === activeIndex}
              className={cx(style.option, index === activeIndex && style.active)}
              onMouseDown={() => choose(index)}
            >
              <span className={style.name}>{result.name}</span>
              <span className={style.count}>
                {intl.formatMessage(
                  { id: 'layout.searchbar.stays' },
                  { count: result.listingsCount },
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

DestinationAutocomplete.propTypes = {
  onSelect: PropTypes.func.isRequired,
};
