import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import RadioRow from '../../../styleguide/components/RadioRow/RadioRow';
import * as style from './modals.module.scss';

const OPTIONS = ['exact', 'plusMinus3', 'flexible'];

// Wizard step 2: how flexible the guest's dates are (helps the host counter).
export default function NegotiationStepDates({ value, onChange }) {
  return (
    <div className={style.body}>
      <p className={style.prose}>
        <FormattedMessage id="listingDetail.negotiate.datesIntro" />
      </p>
      {OPTIONS.map((option) => (
        <RadioRow
          key={option}
          name="negotiate-flexibility"
          value={option}
          checked={value === option}
          onChange={() => onChange(option)}
          label={<FormattedMessage id={`listingDetail.negotiate.flex.${option}`} />}
        />
      ))}
    </div>
  );
}

NegotiationStepDates.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
