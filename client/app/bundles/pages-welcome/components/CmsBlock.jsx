import React from 'react';
import PropTypes from 'prop-types';
import * as style from './sections.module.scss';

// Marketing copy served from content_pages (CMS blocks).
export default function CmsBlock({ cms }) {
  if (!cms) return null;

  return (
    <section className={style.cms}>
      <h2 className={style.sectionTitle}>{cms.title}</h2>
      <p>{cms.body}</p>
    </section>
  );
}

CmsBlock.propTypes = {
  cms: PropTypes.shape({ title: PropTypes.string, body: PropTypes.string }),
};
