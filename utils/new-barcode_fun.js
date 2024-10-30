const bwipjs = require("bwip-js");

// Generate EAN-128 barcode with bwip-js
async function generateNewBarcode(trackId, zipcode) {
  try {
    const firstTwoDigits = trackId.substring(0, 2);
    const remainingTrackingId = trackId.substring(2);
    const barcodeData = `(420)${zipcode}(${firstTwoDigits})${remainingTrackingId}`;

    let png = await bwipjs.toBuffer({
      bcid: "gs1-128", // Barcode type: Code 128 (supports GS1-128)
      text: barcodeData, // Data with escape sequence (~202 for FNC1)
      scale: 3,
      height: 58,
    });
    return png;
  } catch (e) {
    return null;
  }
}

module.exports = generateNewBarcode;
