const bwipjs = require("bwip-js");
const fs = require("fs");

// Barcode data with tilde escape (~202) for FNC1

// Generate EAN-128 barcode with bwip-js
function generateNewBarcode(trackId, zipcode) {
  const firstTwoDigits = trackId.substring(0, 2);
  const remainingTrackingId = trackId.substring(2);
  const barcodeData = `~202420${zipcode}\x1D${firstTwoDigits}${remainingTrackingId}`;

  bwipjs.toBuffer(
    {
      bcid: "gs1-128", // Barcode type: Code 128 (supports GS1-128)
      text: barcodeData, // Data with escape sequence (~202 for FNC1)
      scale: 3, // Scale factor for size
      height: 58, // Height of the barcode
      textxalign: "center", // Align text in the center
      textsize: 10, // Size of human-readable text
    },
    (err, png) => {
      if (err) {
        // console.error("Error generating barcode:", err);
      } else {
        // Save the barcode as a PNG file
        fs.writeFileSync(`./assets/barcodes/${trackId}-barcode.png`, png);
        console.log("Barcode generated and saved as ean128-barcode.png");
      }
    }
  );
  return `./assets/barcodes/${trackId}-barcode.png`;
}

module.exports = generateNewBarcode;
