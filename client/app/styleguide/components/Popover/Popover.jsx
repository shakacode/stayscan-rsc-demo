import React, { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import cx from '../../cx';
import { usePopoverManager } from './PopoverManager';
import * as style from './Popover.module.scss';

// Click-to-open popover. Inside a PopoverManager it participates in the
// single-open group (opening one closes the rest); standalone it manages its
// own state. Closes on outside mousedown and Escape. `trigger` is a render prop
// receiving { isOpen, toggle } so callers can style their own control.
export default function Popover({ id, trigger, placement = 'bottom-start', className, children }) {
  const autoId = useId();
  const popoverId = id ?? autoId;
  const controller = usePopoverManager();
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = controller ? controller.openId === popoverId : localOpen;

  const contentRef = useRef(null);
  const triggerRef = useRef(null);

  const setOpen = (next) => {
    if (controller) {
      if (next) controller.open(popoverId);
      else controller.close(popoverId);
    } else {
      setLocalOpen(next);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onDown = (event) => {
      if (contentRef.current?.contains(event.target) || triggerRef.current?.contains(event.target))
        return;
      setOpen(false);
    };
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div className={cx(style.wrap, className)}>
      <span ref={triggerRef} className={style.trigger}>
        {trigger({ isOpen, toggle: () => setOpen(!isOpen) })}
      </span>
      {isOpen && (
        <div ref={contentRef} className={cx(style.content, style[placement])} role="dialog">
          {children}
        </div>
      )}
    </div>
  );
}

Popover.propTypes = {
  id: PropTypes.string,
  trigger: PropTypes.func.isRequired,
  placement: PropTypes.oneOf(['bottom-start', 'bottom-end', 'bottom']),
  className: PropTypes.string,
  children: PropTypes.node,
};
