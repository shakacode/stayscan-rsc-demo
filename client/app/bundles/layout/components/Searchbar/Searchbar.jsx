import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import PopoverManager from '../../../../styleguide/components/Popover/PopoverManager';
import Popover from '../../../../styleguide/components/Popover/Popover';
import DateRangePicker from '../../../../styleguide/components/DateRangePicker/DateRangePicker';
import Stepper from '../../../../styleguide/components/Stepper/Stepper';
import Button from '../../../../styleguide/components/Button/Button';
import DestinationAutocomplete from '../DestinationAutocomplete/DestinationAutocomplete';
import * as style from './Searchbar.module.scss';

const iso = (date) => date.toISOString().slice(0, 10);
const formatRange = ({ from, to }) => {
  const opts = { month: 'short', day: 'numeric' };
  if (from && to)
    return `${from.toLocaleDateString(undefined, opts)} – ${to.toLocaleDateString(undefined, opts)}`;
  if (from) return from.toLocaleDateString(undefined, opts);
  return null;
};

// The navbar search island: destination autocomplete + a date-range popover
// + a guests popover, coordinated by one PopoverManager so opening one closes
// the others. Submits to the browse route.
export default function Searchbar() {
  const intl = useIntl();
  const [destination, setDestination] = useState(null);
  const [range, setRange] = useState({ from: null, to: null });
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const guestCount = guests.adults + guests.children;

  const submit = () => {
    const params = new URLSearchParams({ adults: String(guests.adults) });
    if (destination) params.set('where', destination.path);
    if (range.from) params.set('checkIn', iso(range.from));
    if (range.to) params.set('checkOut', iso(range.to));
    window.location.assign(`/s?${params.toString()}`);
  };

  return (
    <PopoverManager>
      <div className={style.bar} role="search">
        <DestinationAutocomplete onSelect={setDestination} />
        <span className={style.divider} />
        <Popover
          id="searchbar-dates"
          placement="bottom"
          trigger={({ toggle }) => (
            <button type="button" className={style.segment} onClick={toggle}>
              {formatRange(range) ?? intl.formatMessage({ id: 'layout.searchbar.anyWeek' })}
            </button>
          )}
        >
          <DateRangePicker
            value={range}
            onChange={setRange}
            numberOfMonths={2}
            disabledBefore={new Date()}
          />
        </Popover>
        <span className={style.divider} />
        <Popover
          id="searchbar-guests"
          placement="bottom-end"
          trigger={({ toggle }) => (
            <button type="button" className={style.segment} onClick={toggle}>
              {guestCount > 0
                ? intl.formatMessage({ id: 'layout.navbar.guestsCount' }, { count: guestCount })
                : intl.formatMessage({ id: 'layout.searchbar.addGuests' })}
            </button>
          )}
        >
          <div className={style.guests}>
            <Stepper
              label={intl.formatMessage({ id: 'layout.searchbar.adults' })}
              value={guests.adults}
              min={1}
              max={16}
              onChange={(adults) => setGuests((current) => ({ ...current, adults }))}
            />
            <Stepper
              label={intl.formatMessage({ id: 'layout.searchbar.children' })}
              value={guests.children}
              min={0}
              max={10}
              onChange={(children) => setGuests((current) => ({ ...current, children }))}
            />
          </div>
        </Popover>
        <Button variant="primary" className={style.searchButton} onClick={submit}>
          <FormattedMessage id="layout.searchbar.search" />
        </Button>
      </div>
    </PopoverManager>
  );
}
