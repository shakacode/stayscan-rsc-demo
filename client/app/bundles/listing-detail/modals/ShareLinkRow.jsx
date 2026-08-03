import React from 'react';
import PropTypes from 'prop-types';
import * as style from './modals.module.scss';

// One share destination: a crawlable/keyboard-navigable <a> (href + target),
// never an onClick+window.open.
export default function ShareLinkRow({ icon, label, href }) {
  return (
    <a className={style.linkItem} href={href} target="_blank" rel="noopener noreferrer">
      <span className={style.shareRow}>
        <span aria-hidden="true">{icon}</span>
        {label}
      </span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

ShareLinkRow.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};
