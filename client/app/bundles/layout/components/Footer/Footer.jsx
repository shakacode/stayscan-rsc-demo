import React from 'react';
import { FormattedMessage } from 'react-intl';
import * as style from './Footer.module.scss';

// Column groups keyed to the marketing/legal routes. Crawlable <a href> links.
const COLUMNS = [
  {
    titleId: 'layout.footer.company',
    links: [
      { href: '/about', labelId: 'layout.footer.about' },
      { href: '/contact', labelId: 'layout.footer.contact' },
    ],
  },
  { titleId: 'layout.footer.support', links: [{ href: '/faq', labelId: 'layout.footer.faq' }] },
  {
    titleId: 'layout.footer.legal',
    links: [
      { href: '/tos', labelId: 'layout.footer.terms' },
      { href: '/privacy', labelId: 'layout.footer.privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={style.footer}>
      <p className={style.tagline}>
        <FormattedMessage id="layout.footer.tagline" />
      </p>
      <div className={style.columns}>
        {COLUMNS.map((column) => (
          <nav key={column.titleId} className={style.column}>
            <h2 className={style.heading}>
              <FormattedMessage id={column.titleId} />
            </h2>
            {column.links.map((link) => (
              <a key={link.href} href={link.href} className={style.link}>
                <FormattedMessage id={link.labelId} />
              </a>
            ))}
          </nav>
        ))}
      </div>
    </footer>
  );
}
