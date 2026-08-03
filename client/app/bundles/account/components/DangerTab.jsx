import React from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Button from '../../../styleguide/components/Button/Button';
import { deleteModalToggled } from '../store/accountReducer';
import * as style from '../ror_components/Account.module.scss';

export default function DangerTab() {
  const dispatch = useDispatch();

  return (
    <div className={style.form} data-test-id="account-panel-danger">
      <p className={style.readonly}>
        <FormattedMessage id="account.danger.warning" />
      </p>
      <Button
        variant="danger"
        onClick={() => dispatch(deleteModalToggled(true))}
        data-test-id="account-delete"
      >
        <FormattedMessage id="account.danger.delete" />
      </Button>
    </div>
  );
}
