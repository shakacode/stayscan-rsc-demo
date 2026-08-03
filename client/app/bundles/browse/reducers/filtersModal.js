import { FILTERS_MODAL_TOGGLED, FILTERS_COMMITTED } from '../actions/types';

// Whether the filters modal is open. Committing closes it.
export default function filtersModal(state = false, action) {
  switch (action.type) {
    case FILTERS_MODAL_TOGGLED:
      return action.open;
    case FILTERS_COMMITTED:
      return false;
    default:
      return state;
  }
}
