const PDFDocument = require("pdfkit");
const bwipjs = require("bwip-js");
const fs = require("fs");

//
async function generateUSPSSCANFORM() {
  // Shipment details
  const manifestId = "9475711201080818375960"; // Ensure this is a 20-digit unique ID
  const firstTwoDigits = manifestId.substring(0, 2);
  const remainingTrackingId = manifestId.substring(2);
  const trackingNumbers = [
    "920559035085190098578",
    "920559035085190098579",
    // Add all 53 tracking numbers here
  ];

  // Prepare data for the barcode in GS1-128 format
  let encodedData = `(${firstTwoDigits})${remainingTrackingId}`; // Application Identifier for the manifest
  //   trackingNumbers.forEach((tracking) => {
  //     encodedData += `(420)${tracking}`; // Add each tracking number with AI (420)
  //   });

  // Generate the barcode
  bwipjs.toBuffer(
    {
      bcid: "gs1-128", // Barcode type
      text: encodedData, // Data to encode
      scale: 3, // Scaling factor
      height: 20, // Barcode height in millimeters
      includetext: true, // Include human-readable text below the barcode
      parsefnc: true, // Enable FNC1 character parsing (required for GS1-128)
    },
    (err, png) => {
      if (err) {
        console.error("Error generating barcode:", err);
      } else {
        // Save the barcode as an image file
        fs.writeFileSync("master-barcode.png", png);
        console.log("Barcode saved as master-barcode.png");
      }
    }
  );
}

module.exports = generateUSPSSCANFORM;
