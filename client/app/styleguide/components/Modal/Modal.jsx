import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import cx from '../../cx';
import * as style from './Modal.module.scss';

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Accessible modal: portals to <body>, traps focus, closes on Escape / overlay
// click, restores focus to the opener. `testId` renders as data-test-id.
export default function Modal({ isOpen, onClose, title, testId, size = 'md', children }) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  // Keep the latest onClose without making the focus effect depend on it — parents
  // pass a fresh closure each render, and re-running the effect would steal focus
  // from inputs on every keystroke.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;
    openerRef.current = document.activeElement;
    const dialog = dialogRef.current;
    const focusables = () =>
      Array.from(dialog.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    (focusables()[0] || dialog).focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus();
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    // Backdrop is a mouse convenience; keyboard users close via Escape or the Close button.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={style.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className={cx(style.dialog, style[size])}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-test-id={testId}
        tabIndex={-1}
      >
        {title && <h2 className={style.title}>{title}</h2>}
        <button type="button" className={style.close} aria-label="Close" onClick={onClose}>
          &times;
        </button>
        <div className={style.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  testId: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  children: PropTypes.node,
};
