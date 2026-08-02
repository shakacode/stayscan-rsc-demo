import React from 'react';
import PropTypes from 'prop-types';
import usePageStore from '../../layout/store/usePageStore';
import LayoutProviders from '../../layout/LayoutProviders';
import LayoutShell from '../../layout/LayoutShell';
import layoutEn from '../../layout/i18n/en.json';
import profileEn from '../../profile/i18n/en.json';
import ProfileView from '../../profile/ProfileView';

const CATALOGS = { en: { ...layoutEn, ...profileEn } };

// Public traveler/host profile page.
export default function UsersShow({ user, layout, locale = 'en' }) {
  const store = usePageStore({ layout });

  return (
    <LayoutProviders store={store} locale={locale} messages={CATALOGS[locale] ?? CATALOGS.en}>
      <LayoutShell>
        <ProfileView user={user} variant="user" basePath={`/users/${user.id}`} />
      </LayoutShell>
    </LayoutProviders>
  );
}

UsersShow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
};
