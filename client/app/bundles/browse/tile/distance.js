const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg) => (deg * Math.PI) / 180;

// Great-circle distance between two lat/lng points, in meters (haversine). Used to
// show each tile's distance from the search center.
export function haversineMeters(from, to) {
  if (!from || !to || from.lat == null || to.lat == null) return null;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
