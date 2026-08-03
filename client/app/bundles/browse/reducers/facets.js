// The filter options shipped with the page (amenity set + price bounds). Static —
// seeded from the index payload, so it's a passthrough reducer.
const initial = { amenities: [], priceBounds: { min: 0, max: 1000 } };

export default function facets(state = initial) {
  return state;
}
