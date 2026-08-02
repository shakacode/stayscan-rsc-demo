import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

// Coordinates a group of popovers so at most one is open. Opening B closes A
// even when B's trigger lives inside A (the "hide A before opening B" rule that
// a plain outside-click handler can't catch, since the click is inside A).
const PopoverContext = createContext(null);

export function usePopoverManager() {
  return useContext(PopoverContext);
}

export default function PopoverManager({ children }) {
  const [openId, setOpenId] = useState(null);

  const open = useCallback((id) => setOpenId(id), []);
  const close = useCallback(
    (id) => setOpenId((current) => (id == null || current === id ? null : current)),
    [],
  );

  const value = useMemo(() => ({ openId, open, close }), [openId, open, close]);

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

PopoverManager.propTypes = {
  children: PropTypes.node,
};
