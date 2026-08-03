// Maps a LayoutJson payload (rendered server-side) into preloaded layout
// slices for createPageStore, so the store hydrates with the same data the server
// used to render — avoiding a flash on hydration.
export default function seedLayoutState(layout = {}) {
  const state = {};

  if (layout.user !== undefined) {
    state.session = { user: layout.user };
  }
  if (layout.currencies || layout.currentCurrency) {
    state.currencyModal = {
      open: false,
      current: layout.currentCurrency ?? 'USD',
      currencies: layout.currencies ?? [],
    };
  }
  if (layout.alerts) {
    state.alerts = { items: layout.alerts };
  }

  return state;
}
