import layoutEn from '../../layout/i18n/en.json';
import welcomeEn from './en.json';

const en = { ...layoutEn, ...welcomeEn };

// Pseudo-localization: brackets every message so untranslated/hardcoded
// strings stand out and i18n coverage can be asserted. Wrapping (rather than
// transliterating) keeps ICU placeholders like {count} intact.
function pseudo(messages) {
  return Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, `⟦${value}⟧`]));
}

// react-intl always runs with the `en` formatter (numbers/plurals); only the
// message strings change for the pseudo locale.
export default function buildCatalogs(locale) {
  if (locale === 'pseudo') return { locale: 'en', messages: pseudo(en) };
  return { locale: 'en', messages: en };
}
