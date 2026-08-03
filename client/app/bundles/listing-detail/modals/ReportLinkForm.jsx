import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import ModalActions from './ModalActions';
import * as style from './modals.module.scss';

// Report form for a broken alternative link: pick a reason, submit. The parent
// owns the submit (resolve → success view, reject → failure view).
export default function ReportLinkForm({ channelLabel, onSubmit, onCancel }) {
  const intl = useIntl();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await onSubmit(reason);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={style.body} data-test-id="report-link-form">
      <p className={style.prose}>
        <FormattedMessage
          id="listingDetail.alternatives.reportIntro"
          values={{ channel: channelLabel }}
        />
      </p>
      <textarea
        className={style.textarea}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        aria-label={intl.formatMessage({ id: 'listingDetail.alternatives.reason' })}
        data-test-id="report-reason"
      />
      <ModalActions>
        <Button variant="ghost" onClick={onCancel}>
          <FormattedMessage id="listingDetail.modal.back" />
        </Button>
        <Button
          variant="primary"
          disabled={reason.trim().length === 0}
          loading={busy}
          onClick={submit}
          data-test-id="report-submit"
        >
          <FormattedMessage id="listingDetail.alternatives.reportSubmit" />
        </Button>
      </ModalActions>
    </div>
  );
}

ReportLinkForm.propTypes = {
  channelLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
