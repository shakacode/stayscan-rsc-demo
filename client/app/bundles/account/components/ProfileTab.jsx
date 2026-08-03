import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import Input from '../../../styleguide/components/Input/Input';
import { fieldChanged } from '../store/accountReducer';
import SaveBar from './SaveBar';
import * as style from '../ror_components/Account.module.scss';

export default function ProfileTab() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const name = useSelector((state) => state.account.name);
  const about = useSelector((state) => state.account.about);

  return (
    <div className={style.form} data-test-id="account-panel-profile">
      <Input
        label={intl.formatMessage({ id: 'account.profile.name' })}
        value={name}
        onChange={(event) => dispatch(fieldChanged('name', event.target.value))}
        data-test-id="account-name"
      />
      <div className={style.field}>
        <label className={style.label} htmlFor="account-about">
          <FormattedMessage id="account.profile.about" />
        </label>
        <textarea
          id="account-about"
          className={style.textarea}
          value={about}
          onChange={(event) => dispatch(fieldChanged('about', event.target.value))}
          data-test-id="account-about"
        />
      </div>
      <SaveBar tab="profile" />
    </div>
  );
}
