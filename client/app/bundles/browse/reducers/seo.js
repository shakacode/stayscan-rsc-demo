import { SEO_SET } from '../actions/types';

const initial = { title: '', description: '' };

export default function seo(state = initial, action) {
  return action.type === SEO_SET ? action.seo : state;
}
