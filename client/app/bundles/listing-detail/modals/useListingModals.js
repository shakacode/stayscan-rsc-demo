import { useCallback, useState } from 'react';

// One place the listing-detail view tracks which modal is open + its payload, so any section can
// open a modal and ListingModals renders exactly one. Returns named openers to keep
// call sites declarative.
export default function useListingModals() {
  const [modal, setModal] = useState({ name: null, payload: null });

  const open = useCallback((name, payload = null) => setModal({ name, payload }), []);
  const close = useCallback(() => setModal({ name: null, payload: null }), []);

  return { modal, open, close };
}
