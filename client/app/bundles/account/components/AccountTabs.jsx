import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import cx from '../../../styleguide/cx';
import { setTab } from '../store/accountReducer';
import * as style from '../ror_components/Account.module.scss';

const TABS = ['profile', 'email', 'password', 'danger'];

// The settings tab bar.
export default function AccountTabs() {
  const dispatch = useDispatch();
  const active = useSelector((state) => state.account.tab);

  return (
    <div className={style.tabs} role="tablist" data-test-id="account-tabs">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          className={cx(style.tab, active === tab && style.tabActive)}
          onClick={() => dispatch(setTab(tab))}
          data-test-id={`account-tab-${tab}`}
        >
          <FormattedMessage id={`account.tab.${tab}`} />
        </button>
      ))}
    </div>
  );
}
