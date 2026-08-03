import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from '../../../styleguide/components/Modal/Modal';
import Button from '../../../styleguide/components/Button/Button';
import Input from '../../../styleguide/components/Input/Input';
import { deleteModalToggled } from '../store/accountReducer';
import * as style from '../ror_components/Account.module.scss';

const CONFIRM_WORD = 'DELETE';

// Delete-account confirmation: requires typing DELETE before the destructive action
// enables (real deletion is a follow-up).
export default function DeleteAccountModal() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const open = useSelector((state) => state.account.deleteModalOpen);
  const [confirm, setConfirm] = useState('');

  if (!open) return null;

  return (
    <Modal
      isOpen
      onClose={() => dispatch(deleteModalToggled(false))}
      title={intl.formatMessage({ id: 'account.danger.delete' })}
      testId="delete-account-modal"
    >
      <p>
        <FormattedMessage id="account.delete.confirm" values={{ word: CONFIRM_WORD }} />
      </p>
      <Input
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        data-test-id="delete-confirm-input"
        aria-label={intl.formatMessage({ id: 'account.delete.label' })}
      />
      <div className={style.saveBar}>
        <Button variant="ghost" onClick={() => dispatch(deleteModalToggled(false))}>
          <FormattedMessage id="account.delete.cancel" />
        </Button>
        <Button variant="danger" disabled={confirm !== CONFIRM_WORD} data-test-id="delete-confirm">
          <FormattedMessage id="account.danger.delete" />
        </Button>
      </div>
    </Modal>
  );
}
