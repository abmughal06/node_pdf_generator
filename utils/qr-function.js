const bwipjs = require("bwip-js");

async function generateQRCode(trackingId, zipCode) {
  const firstTwoDigits = trackingId.substring(0, 2);
  const remainingTrackingId = trackingId.substring(2);

  // Add QR code
  let id = `\x1D420${zipCode}\x1D${firstTwoDigits}${remainingTrackingId}`;
  let png = await bwipjs.toBuffer({
    bcid: "datamatrix",
    text: id,
    scale: 3,
    includetext: false,
  });
  return png;
}

module.exports = generateQRCode;
