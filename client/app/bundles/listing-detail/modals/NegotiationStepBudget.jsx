import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Input from '../../../styleguide/components/Input/Input';
import * as style from './modals.module.scss';

// Wizard step 1: the nightly price the guest hopes to reach.
export default function NegotiationStepBudget({ value, error, onChange }) {
  const intl = useIntl();

  return (
    <div className={style.body}>
      <p className={style.prose}>
        <FormattedMessage id="listingDetail.negotiate.budgetIntro" />
      </p>
      <Input
        type="number"
        min="1"
        label={intl.formatMessage({ id: 'listingDetail.negotiate.targetLabel' })}
        value={value}
        error={error}
        onChange={(event) => onChange(event.target.value)}
        data-test-id="negotiate-target"
      />
    </div>
  );
}

NegotiationStepBudget.propTypes = {
  value: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
