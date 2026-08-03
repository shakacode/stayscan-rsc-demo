import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import usePageStore from '../../layout/store/usePageStore';
import LayoutProviders from '../../layout/LayoutProviders';
import LayoutShell from '../../layout/LayoutShell';
import layoutEn from '../../layout/i18n/en.json';
import hostMapEn from '../i18n/en.json';
import ListingsMap from '../../../styleguide/components/ListingsMap/ListingsMap';
import * as style from './HostMap.module.scss';

const CATALOGS = { en: { ...layoutEn, ...hostMapEn } };

// A host's listings on the shared dual-engine map — its own bundle, reusing
// the ListingsMap wrapper (no browse view store; markers come straight from the tiles).
export default function HostMap({ host, tiles, mapEngine, layout, locale = 'en' }) {
  const store = usePageStore({ layout });
  const markers = tiles
    .filter((tile) => tile.coordinates && tile.coordinates.lat != null)
    .map((tile) => ({
      id: tile.id,
      lat: tile.coordinates.lat,
      lng: tile.coordinates.lng,
      price: tile.previewPrice,
    }));

  return (
    <LayoutProviders store={store} locale={locale} messages={CATALOGS[locale] ?? CATALOGS.en}>
      <LayoutShell>
        <main className={style.page} data-test-id="host-map-page">
          <h1 className={style.title}>
            <FormattedMessage id="hostMap.title" values={{ name: host.name }} />
          </h1>
          <div className={style.mapWrap}>
            <ListingsMap
              engine={mapEngine}
              markers={markers}
              onMarkerClick={(id) => {
                window.location.href = `/listings/${id}`;
              }}
            />
          </div>
        </main>
      </LayoutShell>
    </LayoutProviders>
  );
}

HostMap.propTypes = {
  host: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }).isRequired,
  tiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  mapEngine: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  layout: PropTypes.object,
  locale: PropTypes.string,
};
