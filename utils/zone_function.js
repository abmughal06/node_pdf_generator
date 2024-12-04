const stateCoordinates = require("../utils/assets/states_coordinates.js");

// Haversine formula to calculate distance between two points
function haversineDistance(coord1, coord2) {
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const R = 3958.8; // Radius of Earth in miles

  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
}

// Function to determine the zone based on distance
exports.getZone = (stateAbbr1, stateAbbr2) => {
  const coord1 = stateCoordinates[stateAbbr1.toUpperCase()];
  const coord2 = stateCoordinates[stateAbbr2.toUpperCase()];

  if (!coord1 || !coord2) {
    return "Zone 1";
  }

  const distance = haversineDistance(coord1, coord2);

  // Define zones based on distance ranges
  if (distance <= 50) return "Zone 1";
  if (distance <= 150) return "Zone 2";
  if (distance <= 300) return "Zone 3";
  if (distance <= 600) return "Zone 4";
  if (distance <= 1000) return "Zone 5";
  if (distance <= 1400) return "Zone 6";
  if (distance <= 1800) return "Zone 7";
  return "Zone 8";
};
