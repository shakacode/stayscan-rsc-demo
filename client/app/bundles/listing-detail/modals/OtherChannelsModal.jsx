import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';
import AlternativeLinkItem from './AlternativeLinkItem';
import ReportLinkForm from './ReportLinkForm';
import * as style from './modals.module.scss';

// Alternative booking links across channels, with the report flow: a
// view/report/success/failure family. `reportLink` is injected so a rejected
// report shows the failure view.
export default function OtherChannelsModal({
  listing,
  reportLink = () => Promise.resolve(),
  onClose,
}) {
  const intl = useIntl();
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);

  const channels = listing.channels ?? [];

  const startReport = (channel) => {
    setSelected(channel);
    setView('report');
  };

  const submitReport = async (reason) => {
    try {
      await reportLink({ provider: selected.providerType, reason });
      setView('success');
    } catch {
      setView('failure');
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={intl.formatMessage({ id: 'listingDetail.alternatives.title' })}
      testId="alternatives-modal"
    >
      {view === 'list' && (
        <div className={style.linkList}>
          {channels.map((channel) => (
            <AlternativeLinkItem
              key={channel.providerType}
              label={channel.label}
              href={`https://${channel.providerType}.example/stay/${listing.id}`}
              onReport={() => startReport(channel)}
            />
          ))}
        </div>
      )}

      {view === 'report' && (
        <ReportLinkForm
          channelLabel={selected?.label}
          onSubmit={submitReport}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'success' && (
        <div className={style.success} data-test-id="report-success">
          <div className={style.successMark} aria-hidden="true">
            ✓
          </div>
          <p className={style.prose}>
            <FormattedMessage id="listingDetail.alternatives.reportSuccess" />
          </p>
          <Button variant="primary" onClick={onClose}>
            <FormattedMessage id="listingDetail.modal.done" />
          </Button>
        </div>
      )}

      {view === 'failure' && (
        <div className={style.success} data-test-id="report-failure">
          <p className={style.error}>
            <FormattedMessage id="listingDetail.alternatives.reportFailure" />
          </p>
          <Button variant="secondary" onClick={() => setView('report')}>
            <FormattedMessage id="listingDetail.alternatives.retry" />
          </Button>
        </div>
      )}
    </Modal>
  );
}

OtherChannelsModal.propTypes = {
  listing: PropTypes.shape({ id: PropTypes.number, channels: PropTypes.arrayOf(PropTypes.object) })
    .isRequired,
  reportLink: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
