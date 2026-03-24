
const fs = require('fs');
const path = require('path');

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

const districtsPath = 'c:\\Users\\CEO\\Desktop\\antigravity projects\\Agriculture edutech\\src\\data\\india_districts.json';
const neighborsPath = 'c:\\Users\\CEO\\Desktop\\antigravity projects\\Agriculture edutech\\src\\data\\district_neighbors.json';

const districtsData = JSON.parse(fs.readFileSync(districtsPath, 'utf8'));
const neighborsData = JSON.parse(fs.readFileSync(neighborsPath, 'utf8'));

const districtCoords = {};
for (const [state, dists] of Object.entries(districtsData)) {
    for (const d of dists) {
        districtCoords[d.district.toLowerCase().trim()] = { lat: d.lat, lng: d.lng };
    }
}

const errorReport = [];

for (const stateName of ["Madhya Pradesh", "Chhattisgarh"]) {
    if (!neighborsData[stateName]) {
        errorReport.push(`MISSING STATE IN NEIGHBORS: ${stateName}`);
        continue;
    }

    for (const [originDistrict, neighbors] of Object.entries(neighborsData[stateName])) {
        const originKey = originDistrict.toLowerCase().trim();
        if (!districtCoords[originKey]) {
            errorReport.push(`ORIGIN NOT IN COORDS DB: ${originDistrict}`);
            continue;
        }

        const { lat: originLat, lng: originLng } = districtCoords[originKey];

        for (const n of neighbors) {
            const destKey = n.district.toLowerCase().trim();
            let destLat, destLng;

            if (!districtCoords[destKey]) {
                let found = false;
                for (const [s, ds] of Object.entries(districtsData)) {
                    for (const d of ds) {
                        if (d.district.toLowerCase().trim() === destKey) {
                            destLat = d.lat;
                            destLng = d.lng;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                if (!found) {
                    errorReport.push(`NEIGHBOR NOT IN COORDS DB: ${n.district} (Neighbor of ${originDistrict})`);
                    continue;
                }
            } else {
                destLat = districtCoords[destKey].lat;
                destLng = districtCoords[destKey].lng;
            }

            const calcDist = calculateDistance(originLat, originLng, destLat, destLng);
            const givenDist = n.distance_km;

            if (Math.abs(calcDist - givenDist) > 30) { 
                errorReport.push(`PRECISION ERROR: ${originDistrict} -> ${n.district}: JSON says ${givenDist}km, Calc says ${calcDist}km`);
            }
        }
    }
}

fs.writeFileSync('c:\\Users\\CEO\\Desktop\\antigravity projects\\Agriculture edutech\\audit_results_tmp.txt', errorReport.join('\n'));
console.log(`Audit Complete. Errors found: ${errorReport.length}`);
if (errorReport.length > 0) {
    console.log("Top 5 errors:");
    console.log(errorReport.slice(0, 5).join('\n'));
}
