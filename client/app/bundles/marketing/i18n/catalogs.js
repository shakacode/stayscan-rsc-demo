import layoutEn from '../../layout/i18n/en.json';
import marketingEn from './en.json';

function pseudo(messages) {
  return Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, `⟦${value}⟧`]));
}

// Merge the layout + shared marketing catalogs with the calling page's own
// per-page catalog. Pseudo brackets everything for i18n coverage checks.
export default function buildCatalogs(locale, pageMessages = {}) {
  const en = { ...layoutEn, ...marketingEn, ...pageMessages };
  if (locale === 'pseudo') return { locale: 'en', messages: pseudo(en) };
  return { locale: 'en', messages: en };
}
