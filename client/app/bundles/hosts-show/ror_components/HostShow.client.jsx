import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import usePageStore from '../../layout/store/usePageStore';
import LayoutProviders from '../../layout/LayoutProviders';
import LayoutShell from '../../layout/LayoutShell';
import layoutEn from '../../layout/i18n/en.json';
import profileEn from '../../profile/i18n/en.json';
import ProfileView from '../../profile/ProfileView';
import * as style from './HostShow.module.scss';

const CATALOGS = { en: { ...layoutEn, ...profileEn } };

// Public host page: the profile in its host framing, plus a link to the
// separate host map-view bundle.
export default function HostShow({ user, layout, locale = 'en' }) {
  const store = usePageStore({ layout });

  return (
    <LayoutProviders store={store} locale={locale} messages={CATALOGS[locale] ?? CATALOGS.en}>
      <LayoutShell>
        <div className={style.mapLinkRow}>
          <a className={style.mapLink} href={`/hosts/${user.id}/map`} data-test-id="host-map-link">
            <FormattedMessage id="profile.host.viewMap" />
          </a>
        </div>
        <ProfileView user={user} variant="host" basePath={`/hosts/${user.id}`} />
      </LayoutShell>
    </LayoutProviders>
  );
}

HostShow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
};
