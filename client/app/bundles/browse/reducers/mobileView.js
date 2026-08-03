import { MOBILE_VIEW_TOGGLED } from '../actions/types';

// The mobile list/map toggle ('list' | 'map'); ignored on desktop (both show).
export default function mobileView(state = 'list', action) {
  return action.type === MOBILE_VIEW_TOGGLED ? action.view : state;
}
