import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Checkbox from '../../../styleguide/components/Checkbox/Checkbox';
import { fieldChanged } from '../store/accountReducer';
import SaveBar from './SaveBar';
import * as style from '../ror_components/Account.module.scss';

export default function EmailPrefsTab() {
  const dispatch = useDispatch();
  const email = useSelector((state) => state.account.email);
  const emailDeals = useSelector((state) => state.account.emailDeals);
  const emailDigest = useSelector((state) => state.account.emailDigest);

  return (
    <div className={style.form} data-test-id="account-panel-email">
      <p className={style.readonly}>
        <FormattedMessage id="account.email.address" values={{ email }} />
      </p>
      <Checkbox
        id="account-email-deals"
        checked={emailDeals}
        onChange={(event) => dispatch(fieldChanged('emailDeals', event.target.checked))}
        label={<FormattedMessage id="account.email.deals" />}
      />
      <Checkbox
        id="account-email-digest"
        checked={emailDigest}
        onChange={(event) => dispatch(fieldChanged('emailDigest', event.target.checked))}
        label={<FormattedMessage id="account.email.digest" />}
      />
      <SaveBar tab="email" />
    </div>
  );
}
