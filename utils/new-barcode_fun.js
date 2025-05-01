const bwipjs = require("bwip-js");

// Generate EAN-128 barcode with bwip-js
exports.generateNewBarcode = async (trackId, zipcode) => {
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
};

function formatValue(input) {}

exports.generateNewBarcode1UPS = async (zipcode) => {
  try {
    // const firstTwoDigits = trackId.substring(0, 2);
    // const remainingTrackingId = trackId.substring(2);
    let barcodeData = `420${zipcode}`;

    if (barcodeData.includes("-")) {
      // Remove the hyphen if present
      barcodeData = barcodeData.replace("-", "");
    } else if (barcodeData.length === 8) {
      // Append "0000" if input is exactly 6 digits
      barcodeData = barcodeData + "0000";
    }

    let png = await bwipjs.toBuffer({
      bcid: "code128", // Barcode type: Code 128 (supports GS1-128)
      text: barcodeData, // Data with escape sequence (~202 for FNC1)
      scale: 3,
      height: 58,
      parse: true,
    });
    return png;
  } catch (e) {
    return null;
  }
};
exports.generateNewBarcode2UPS = async (tracking) => {
  try {
    // const firstTwoDigits = trackId.substring(0, 2);
    // const remainingTrackingId = trackId.substring(2);
    const barcodeData = `${tracking}`;

    let png = await bwipjs.toBuffer({
      bcid: "code128", // Barcode type: Code 128 (supports GS1-128)
      text: barcodeData, // Data with escape sequence (~202 for FNC1)
      scale: 3,
      height: 58,
    });
    return png;
  } catch (e) {
    return null;
  }
};
