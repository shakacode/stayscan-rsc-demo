import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';
import PlanList from './PlanList';
import * as style from './modals.module.scss';

// The anonymous quote-limit gate (gating): explains the limit, offers sign
// in for logged-out guests, and shows the upgrade plans. `isAuthenticated` +
// `onSignIn` are injected by UsageLimitModalContainer (connect).
export default function UsageLimitModal({
  plans,
  access,
  isAuthenticated,
  onSignIn,
  onChoosePlan,
  onClose,
}) {
  const intl = useIntl();

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={intl.formatMessage({ id: 'listingDetail.limit.title' })}
      testId="usage-limit-modal"
      size="lg"
    >
      <div className={style.body}>
        <p className={style.prose}>
          <FormattedMessage
            id="listingDetail.limit.body"
            values={{ limit: access?.limit ?? 0, used: access?.used ?? 0 }}
          />
        </p>

        {!isAuthenticated && (
          <Button variant="primary" onClick={onSignIn} data-test-id="limit-sign-in">
            <FormattedMessage id="listingDetail.limit.signIn" />
          </Button>
        )}

        <p className={style.muted}>
          <FormattedMessage id="listingDetail.limit.upgradeIntro" />
        </p>
        <PlanList plans={plans} onChoose={onChoosePlan} />
      </div>
    </Modal>
  );
}

UsageLimitModal.propTypes = {
  plans: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  access: PropTypes.object,
  isAuthenticated: PropTypes.bool,
  onSignIn: PropTypes.func.isRequired,
  onChoosePlan: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
