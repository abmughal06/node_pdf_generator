const bwipjs = require("bwip-js");

// Generate EAN-128 barcode with bwip-js
exports.generatePdf417Barcode = async (trackId, fromZipcode, toZipcode) => {
  try {
    // const firstTwoDigits = trackId.substring(0, 2);
    // const remainingTrackingId = trackId.substring(2);
    const barcodeData = `${trackId}${fromZipcode}${toZipcode}`;

    let png = await bwipjs.toBuffer({
      bcid: "pdf417", // Barcode type: Code 128 (supports GS1-128)
      text: barcodeData, // Data with escape sequence (~202 for FNC1)
      scale: 3,
      columns: 7,
      rows: 14,
    });
    return png;
  } catch (e) {
    return null;
  }
};
