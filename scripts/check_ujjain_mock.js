const district = "Ujjain";
const seed = district.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
console.log("District:", district);
console.log("Seed:", seed);
console.log("Seed % 600:", seed % 600);
console.log("Onion Mock Price (1500 + %600):", 1500 + (seed % 600));

const volAvg = 50 + (district.length * 5); // From api.js:1053
const volCurrent = volAvg + (district.length % 10) - 5; // From api.js:1057
console.log("Mock Volume (Current):", volCurrent);
