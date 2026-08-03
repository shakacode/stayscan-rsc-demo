// Flash alerts strip. Seeded from LayoutJson.alerts (server flash); alertsSaga
// auto-dismisses transient ones.
let nextId = 0;

export const ADD_ALERT = 'layout/alerts/ADD';
export const DISMISS_ALERT = 'layout/alerts/DISMISS';

export const addAlert = (alert) => ({
  type: ADD_ALERT,
  // eslint-disable-next-line no-plusplus
  alert: { id: alert.id ?? `alert-${nextId++}`, kind: 'info', autoDismiss: true, ...alert },
});
export const dismissAlert = (id) => ({ type: DISMISS_ALERT, id });

const initialState = { items: [] };

export default function alertsReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_ALERT:
      return { ...state, items: [...state.items, action.alert] };
    case DISMISS_ALERT:
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };
    default:
      return state;
  }
}
