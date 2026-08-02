import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Input from '../../../styleguide/components/Input/Input';
import * as style from './modals.module.scss';

// Step 1 of the booking inquiry: name, email and the message to the host.
// Controlled — the modal owns the values.
export default function InquiryForm({ values, errors, onChange }) {
  const intl = useIntl();

  return (
    <div className={style.body}>
      <Input
        label={intl.formatMessage({ id: 'listingDetail.inquiry.name' })}
        value={values.name}
        error={errors.name}
        onChange={(event) => onChange({ name: event.target.value })}
        data-test-id="inquiry-name"
      />
      <Input
        label={intl.formatMessage({ id: 'listingDetail.inquiry.email' })}
        type="email"
        value={values.email}
        error={errors.email}
        onChange={(event) => onChange({ email: event.target.value })}
        data-test-id="inquiry-email"
      />
      <div className={style.field}>
        <label className={style.label} htmlFor="inquiry-message">
          <FormattedMessage id="listingDetail.inquiry.message" />
        </label>
        <textarea
          id="inquiry-message"
          className={style.textarea}
          value={values.message}
          onChange={(event) => onChange({ message: event.target.value })}
        />
      </div>
    </div>
  );
}

InquiryForm.propTypes = {
  values: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
  errors: PropTypes.objectOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
