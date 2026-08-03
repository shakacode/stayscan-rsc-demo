import { MARKER_HOVERED } from '../actions/types';

// The hovered listing id, shared by the map + grid so a marker and its tile
// highlight each other in both directions.
export default function mapHover(state = null, action) {
  return action.type === MARKER_HOVERED ? action.id : state;
}
