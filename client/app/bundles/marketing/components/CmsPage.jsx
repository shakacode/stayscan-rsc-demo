import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import * as page from './marketing.module.scss';
import * as style from './CmsPage.module.scss';

// Renders a content_pages record (about / TOS / privacy).
export default function CmsPage({ cms }) {
  if (!cms) return null;

  return (
    <section className={page.page}>
      <h1 className={page.title}>{cms.title}</h1>
      <div className={style.prose}>{cms.body}</div>
      <a className={page.back} href="/">
        <FormattedMessage id="marketing.back" />
      </a>
    </section>
  );
}

CmsPage.propTypes = {
  cms: PropTypes.shape({ title: PropTypes.string, body: PropTypes.string }),
};
