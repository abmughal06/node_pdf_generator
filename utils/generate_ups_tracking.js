const { getTracking } = require("ts-tracking-number");

const shipperNumberArray = [
  "V80W46",
  "6AW085",
  "7XA556",
  "7E0653",
  "0R9Y79",
  "82V547",
  "G2B007",
  "2F0810",
  "82V063",
  "Y84W31",
  "6AT366",
  "B8B866"
];

function getRandomShipperNumber() {
  const randomIndex = Math.floor(Math.random() * shipperNumberArray.length);
  return shipperNumberArray[randomIndex];
}

function generateUPS2ndDayTracking() {
  const prefix = "1Z";
  const shipperNumber = getRandomShipperNumber(); // Replace with a real shipper number if needed
  const serviceCode = "02"; // 2nd Day Air
  const packageIdentifier = String(
    Math.floor(1000000 + Math.random() * 9000000)
  ); // 7-digit random number

  const trackingWithoutCheckDigit = `${prefix}${shipperNumber}${serviceCode}${packageIdentifier}`;
  const checkDigit = calculateCheckDigit(trackingWithoutCheckDigit);

  return `${trackingWithoutCheckDigit}${checkDigit}`;
}
function generateUPSGroundTracking() {
  const prefix = "1Z";
  const shipperNumber = getRandomShipperNumber(); // Replace with a real shipper number if needed
  const serviceCode = "03"; // 2nd Day Air
  const packageIdentifier = String(
    Math.floor(1000000 + Math.random() * 9000000)
  ); // 7-digit random number

  const trackingWithoutCheckDigit = `${prefix}${shipperNumber}${serviceCode}${packageIdentifier}`;
  const checkDigit = calculateCheckDigit(trackingWithoutCheckDigit);

  return `${trackingWithoutCheckDigit}${checkDigit}`;
}

function calculateCheckDigit(trackingNumber) {
  let sum = 0;
  for (let i = 0; i < trackingNumber.length; i++) {
    const digit = parseInt(trackingNumber[i], 10);
    if (!isNaN(digit)) {
      sum += (i % 2 === 0 ? 2 : 1) * digit;
    }
  }
  return (10 - (sum % 10)) % 10; // Mod 10 check digit
}

exports.generateNewUPSID = () => {
  try {
    const newTracking = generateUPSGroundTracking();
    const tracking = getTracking(newTracking);
    if (tracking) {
      return tracking.trackingNumber;
    } else {
      return exports.generateNewUPSID();
    }
  } catch (e) {
    console.log("Error on generating new ups key", e);
  }
};
