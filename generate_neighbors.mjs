// Haversine District Neighbor Generator for KisanBaba
// Generates district_neighbors.json from india_districts.json
import { readFileSync, writeFileSync } from 'fs';

const MAX_RADIUS_KM = 150;
const districts = JSON.parse(readFileSync('./src/data/india_districts.json', 'utf-8'));

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const result = {};
let totalPairs = 0;

for (const [state, distList] of Object.entries(districts)) {
  result[state] = {};
  for (const origin of distList) {
    const neighbors = [];
    // Check against ALL districts in ALL states (cross-border!)
    for (const [otherState, otherList] of Object.entries(districts)) {
      for (const dest of otherList) {
        if (origin.district === dest.district && state === otherState) continue;
        const dist = Math.round(haversine(origin.lat, origin.lng, dest.lat, dest.lng));
        if (dist <= MAX_RADIUS_KM && dist > 0) {
          neighbors.push({
            district: dest.district,
            state: otherState,
            distance_km: dist,
            transport_factor: parseFloat((1.0 + dist * 0.005).toFixed(2))
          });
        }
      }
    }
    neighbors.sort((a, b) => a.distance_km - b.distance_km);
    result[state][origin.district] = neighbors;
    totalPairs += neighbors.length;
  }
}

writeFileSync('./src/data/district_neighbors.json', JSON.stringify(result, null, 2));
console.log(`Generated district_neighbors.json: ${Object.keys(result).length} states, ${totalPairs} neighbor pairs.`);
