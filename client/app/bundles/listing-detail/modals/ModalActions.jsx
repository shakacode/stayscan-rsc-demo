import React from 'react';
import PropTypes from 'prop-types';
import * as style from './modals.module.scss';

// The right-aligned footer button row shared by the modals.
export default function ModalActions({ children }) {
  return <div className={style.actions}>{children}</div>;
}

ModalActions.propTypes = {
  children: PropTypes.node.isRequired,
};
