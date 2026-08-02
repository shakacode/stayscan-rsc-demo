import { MAP_ZOOM_CHANGED } from '../actions/types';

const DEFAULT_ZOOM = 11;

export default function mapZoom(state = DEFAULT_ZOOM, action) {
  return action.type === MAP_ZOOM_CHANGED ? action.zoom : state;
}
