
import json
import math

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return round(R * c)

with open(r'c:\Users\CEO\Desktop\antigravity projects\Agriculture edutech\src\data\india_districts.json', 'r', encoding='utf-8') as f:
    districts_data = json.load(f)

with open(r'c:\Users\CEO\Desktop\antigravity projects\Agriculture edutech\src\data\district_neighbors.json', 'r', encoding='utf-8') as f:
    neighbors_data = json.load(f)

# Flatten districts for quick lookup
district_coords = {}
for state, dists in districts_data.items():
    for d in dists:
        district_coords[d['district'].lower().strip()] = (d['lat'], d['lng'])

error_report = []

# Audit SAMPLE (Madhya Pradesh & Chhattisgarh)
for state_name in ["Madhya Pradesh", "Chhattisgarh"]:
    if state_name not in neighbors_data:
        error_report.append(f"MISSING STATE IN NEIGHBORS: {state_name}")
        continue
    
    for origin_district, neighbors in neighbors_data[state_name].items():
        if origin_district.lower().strip() not in district_coords:
            error_report.append(f"ORIGIN NOT IN COORDS DB: {origin_district}")
            continue
            
        origin_lat, origin_lng = district_coords[origin_district.lower().strip()]
        
        for n in neighbors:
            dest_district = n['district']
            if dest_district.lower().strip() not in district_coords:
                # Some neighbors might be in other states, handle cross-state lookup
                found = False
                for s, ds in districts_data.items():
                    for d in ds:
                        if d['district'].lower().strip() == dest_district.lower().strip():
                            dest_lat, dest_lng = d['lat'], d['lng']
                            found = True
                            break
                    if found: break
                if not found:
                    error_report.append(f"NEIGHBOR NOT IN COORDS DB: {dest_district} (Neighbor of {origin_district})")
                    continue
            else:
                dest_lat, dest_lng = district_coords[dest_district.lower().strip()]
            
            calc_dist = calculate_distance(origin_lat, origin_lng, dest_lat, dest_lng)
            given_dist = n['distance_km']
            
            if abs(calc_dist - given_dist) > 20: # Allow 20km buffer for APMC center vs district centroid
                error_report.append(f"PRECISION ERROR: {origin_district} -> {dest_district}: JSON says {given_dist}km, Calc says {calc_dist}km")

with open(r'c:\Users\CEO\Desktop\antigravity projects\Agriculture edutech\audit_results_tmp.txt', 'w') as f:
    f.write("\n".join(error_report))

print("Audit Complete. Errors found:", len(error_report))
