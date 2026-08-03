import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import usePageStore from '../../layout/store/usePageStore';
import LayoutProviders from '../../layout/LayoutProviders';
import LayoutShell from '../../layout/LayoutShell';
import layoutEn from '../../layout/i18n/en.json';
import accountEn from '../i18n/en.json';
import accountReducer, { initialAccountState } from '../store/accountReducer';
import accountSaga from '../store/accountSaga';
import AccountTabs from '../components/AccountTabs';
import ProfileTab from '../components/ProfileTab';
import EmailPrefsTab from '../components/EmailPrefsTab';
import PasswordTab from '../components/PasswordTab';
import DangerTab from '../components/DangerTab';
import DeleteAccountModal from '../components/DeleteAccountModal';
import * as style from './Account.module.scss';

const CATALOGS = { en: { ...layoutEn, ...accountEn } };
const PANELS = {
  profile: ProfileTab,
  email: EmailPrefsTab,
  password: PasswordTab,
  danger: DangerTab,
};

function AccountContent() {
  const tab = useSelector((state) => state.account.tab);
  const Panel = PANELS[tab] || ProfileTab;

  return (
    <main className={style.page} data-test-id="account-page">
      <h1 className={style.title}>
        <FormattedMessage id="account.title" />
      </h1>
      <AccountTabs />
      <Panel />
      <DeleteAccountModal />
    </main>
  );
}

// /account settings: the action-heavy, tabbed Redux page with its own store
// slice + save saga, on top of the shared layout store.
export default function Account({ account, layout, locale = 'en' }) {
  const store = usePageStore({
    layout,
    pageReducers: { account: accountReducer },
    pageState: {
      account: {
        ...initialAccountState,
        name: account.name ?? '',
        about: account.about ?? '',
        email: account.email ?? '',
      },
    },
    pageSaga: accountSaga,
  });

  return (
    <LayoutProviders store={store} locale={locale} messages={CATALOGS[locale] ?? CATALOGS.en}>
      <LayoutShell>
        <AccountContent />
      </LayoutShell>
    </LayoutProviders>
  );
}

Account.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  account: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
};
