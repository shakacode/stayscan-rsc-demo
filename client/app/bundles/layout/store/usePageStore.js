import { useRef } from 'react';
import createPageStore from './createPageStore';
import seedLayoutState from './seedLayoutState';

// Create the page store exactly once per mount (surviving re-renders) from server
// props, so the SSR render and the hydrated client share identical initial state.
export default function usePageStore({
  layout,
  pageReducers = {},
  pageState = {},
  pageSaga = null,
} = {}) {
  const ref = useRef(null);
  if (ref.current === null) {
    ref.current = createPageStore(
      pageReducers,
      { ...seedLayoutState(layout), ...pageState },
      pageSaga,
    );
  }
  return ref.current;
}
