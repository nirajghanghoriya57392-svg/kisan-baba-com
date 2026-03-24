/**
 * Master Benchmark Mandis (Price Discovery Hubs)
 * These Mandis set the national price trend for specific commodities.
 */
export const BENCHMARK_HUBS = {
  // SPICES
  "cumin": { name: "Unjha", state: "Gujarat", id: "5045", reason: "Asia's largest cumin market" },
  "jeera": { name: "Unjha", state: "Gujarat", id: "5045", reason: "Asia's largest cumin market" },
  "turmeric": { name: "Nizamabad", state: "Telangana", id: "4685", alternatve: ["Erode", "Sangli"] },
  "chilli": { name: "Guntur", state: "Andhra Pradesh", id: "4501", alternative: ["Byadgi"] },
  "coriander": { name: "Ramganj Mandi", state: "Rajasthan", id: "5254" },
  "garlic": { name: "Mandsaur", state: "Madhya Pradesh", id: "5201" },

  // GRAINS
  "wheat": { name: "Khanna", state: "Punjab", id: "3452", regional: ["Itarsi", "Sehore"] },
  "paddy": { name: "Karnal", state: "Haryana", id: "3567", alternative: ["Kaithal"] },
  "paddy (dhan)": { name: "Karnal", state: "Haryana", id: "3567", alternative: ["Kaithal"] },
  "rice": { name: "Karnal", state: "Haryana", id: "3567" },
  "maize": { name: "Nizamabad", state: "Telangana", id: "4685", alternatives: ["Davangere", "Khagaria"] },

  // OILSEEDS
  "soyabean": { name: "Indore", state: "Madhya Pradesh", id: "5200", alternative: ["Ujjain", "Dewas", "Latur"] },
  "soybean": { name: "Indore", state: "Madhya Pradesh", id: "5200", alternative: ["Ujjain", "Dewas", "Latur"] },
  "mustard": { name: "Bharatpur", state: "Rajasthan", id: "5250", alternative: ["Alwar"] },
  "groundnut": { name: "Rajkot", state: "Gujarat", id: "5040", alternative: ["Gondal"] },

  // VEGETABLES
  "onion": { name: "Lasalgaon", state: "Maharashtra", id: "5100", alternative: ["Pimpalgaon"] },
  "tomato": { name: "Madanapalle", state: "Andhra Pradesh", id: "4505", alternative: ["Kolar"] },
  "potato": { name: "Agra", state: "Uttar Pradesh", id: "5300", alternative: ["Farrukhabad", "Hooghly"] },

  // PULSES (DAL)
  "gram": { name: "Bikaner", state: "Rajasthan", id: "5252", alternative: ["Latur", "Indore"] },
  "chana": { name: "Bikaner", state: "Rajasthan", id: "5252", alternative: ["Latur", "Indore"] },
  "gram (chana)": { name: "Bikaner", state: "Rajasthan", id: "5252", alternative: ["Latur", "Indore"] },
  "tur": { name: "Latur", state: "Maharashtra", id: "5105", alternative: ["Akola", "Gulbarga"] },
  "arhar": { name: "Latur", state: "Maharashtra", id: "5105" },
  "arhar (tur)": { name: "Latur", state: "Maharashtra", id: "5105" },
  "moong": { name: "Indore", state: "Madhya Pradesh", id: "5200" },
  "urad": { name: "Indore", state: "Madhya Pradesh", id: "5200" },

  // CASH CROPS
  "cotton": { name: "Rajkot", state: "Gujarat", id: "5040", alternative: ["Bathinda", "Khamgaon"] },
  "jaggery": { name: "Muzaffarnagar", state: "Uttar Pradesh", id: "5305", alternative: ["Hapur"] },
  "gur": { name: "Muzaffarnagar", state: "Uttar Pradesh", id: "5305" },

  // MILLETS
  "bajra": { name: "Jaipur", state: "Rajasthan", id: "5251" },
  "jowar": { name: "Solapur", state: "Maharashtra", id: "5106" },
  "ragi": { name: "Bangalore", state: "Karnataka", id: "4800" },

  // FRUITS
  "apple": { name: "Azadpur", state: "Delhi", id: "5400", alternative: ["Sopore"] },
  "banana": { name: "Darangiri", state: "Assam", id: "4000", alternative: ["Jalgaon"] },
  "orange": { name: "Nagpur", state: "Maharashtra", id: "5107" }
};

/**
 * Gets the benchmark hub for a given commodity name.
 * @param {string} commodity - The name of the crop.
 * @returns {Object|null} - Benchmark data or null if not found.
 */
export const getBenchmarkHub = (commodity) => {
  if (!commodity) return null;
  const normalized = commodity.toLowerCase().trim();
  return BENCHMARK_HUBS[normalized] || null;
};
