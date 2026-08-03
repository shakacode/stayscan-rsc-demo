import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import Input from '../../../styleguide/components/Input/Input';
import { fieldChanged } from '../store/accountReducer';
import SaveBar from './SaveBar';
import * as style from '../ror_components/Account.module.scss';

export default function PasswordTab() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const currentPassword = useSelector((state) => state.account.currentPassword);
  const newPassword = useSelector((state) => state.account.newPassword);

  return (
    <div className={style.form} data-test-id="account-panel-password">
      <Input
        type="password"
        label={intl.formatMessage({ id: 'account.password.current' })}
        value={currentPassword}
        onChange={(event) => dispatch(fieldChanged('currentPassword', event.target.value))}
        data-test-id="account-current-password"
      />
      <Input
        type="password"
        label={intl.formatMessage({ id: 'account.password.new' })}
        value={newPassword}
        onChange={(event) => dispatch(fieldChanged('newPassword', event.target.value))}
        data-test-id="account-new-password"
      />
      <SaveBar tab="password" />
    </div>
  );
}
