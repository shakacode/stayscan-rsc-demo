import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Checkbox from '../../../styleguide/components/Checkbox/Checkbox';
import GuestStepperRow from './GuestStepperRow';
import * as style from './booking.module.scss';

// Guest counts vs the listing's capacity. Adults+children count toward maxGuests;
// infants don't (a common OTA rule); pets is a boolean. Emits an over-capacity
// validation message the widget blocks the quote on.
export default function GuestSelector({ guests, maxGuests, onChange }) {
  const counted = guests.adults + guests.children;
  const overCapacity = counted > maxGuests;
  const remaining = Math.max(0, maxGuests - counted);

  const update = (patch) => onChange({ ...guests, ...patch });

  return (
    <div className={style.guestGrid} data-test-id="guest-selector">
      <GuestStepperRow
        category="adults"
        value={guests.adults}
        min={1}
        max={guests.adults + remaining}
        onChange={(adults) => update({ adults })}
      />
      <GuestStepperRow
        category="children"
        value={guests.children}
        max={guests.children + remaining}
        onChange={(children) => update({ children })}
      />
      <GuestStepperRow
        category="infants"
        value={guests.infants}
        max={5}
        onChange={(infants) => update({ infants })}
      />

      <Checkbox
        id="booking-pets"
        checked={guests.pets}
        onChange={(event) => update({ pets: event.target.checked })}
        label={<FormattedMessage id="listingDetail.guests.pets" />}
      />

      {overCapacity && (
        <p className={style.validation} data-test-id="capacity-error">
          <FormattedMessage id="listingDetail.guests.overCapacity" values={{ max: maxGuests }} />
        </p>
      )}
    </div>
  );
}

GuestSelector.propTypes = {
  guests: PropTypes.shape({
    adults: PropTypes.number,
    children: PropTypes.number,
    infants: PropTypes.number,
    pets: PropTypes.bool,
  }).isRequired,
  maxGuests: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
