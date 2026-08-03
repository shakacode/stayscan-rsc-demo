import Welcome from './Welcome.client';

// Server entry: the layout store + react-intl render identically server-side, so
// the client entry is reused as-is (no SSR-only specialization needed here).
export default Welcome;
