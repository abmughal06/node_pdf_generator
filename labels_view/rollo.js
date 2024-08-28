const PDFDocument = require("pdfkit");
const fs = require("fs");
const foundLabel = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const formatDate = require("../utils/format-date.js");

async function generateRolloPDF() {
  console.log("generating rollo label pdf... >>>>>>>>>>>>");

  // Create a new PDF document
  const doc = new PDFDocument({
    size: [288, 445], // Adjust size as necessary
    margin: 0,
  });

  // Output to a file
  doc.pipe(fs.createWriteStream("./outputs/rollo.pdf"));

  doc.font("fonts/Helvetica.ttf");

  let isGroundAdvantage = foundLabel.shippingService
    .toLowerCase()
    .includes("ground advantage");

  let tag = "P";
  // Draw the "P" and other texts
  if (isGroundAdvantage) {
    tag = "G";
  }
  doc.fontSize(60).text(tag, 30, 20);

  // Draw vertical line
  doc.moveTo(90, 0).lineTo(90, 80).stroke();

  // Define the position and dimensions of the box
  const boxX = 160;
  const boxY = 20;
  const boxWidth = 100;
  const boxHeight = 40;

  // Draw the box (a rectangle)
  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke(); // `stroke()` draws the border, `fillAndStroke()` will fill and then draw the border

  // Position the text inside the box
  doc.fontSize(10).text("U.S. POSTAGE PAID", boxX + 5, boxY + 5);
  doc.fontSize(10).text(foundLabel.vendor.toUpperCase(), boxX + 5, boxY + 15);
  doc.fontSize(10).text("ePostage", boxX + 5, boxY + 25);

  // Draw line above shipping service name
  doc.moveTo(0, 80).lineTo(288, 80).stroke();

  // // Draw Priority Mail/Ground Advantage text
  doc
    .fontSize(20)
    .text(
      foundLabel.shippingService.toUpperCase(),
      isGroundAdvantage ? 65 : 90,
      88
    );
  // Draw line below shipping service name
  doc.moveTo(0, 110).lineTo(288, 110).stroke();

  // // Sender address
  let senderAddressCY = 115;
  doc.fontSize(10).text(foundLabel.from_name.toUpperCase(), 8, senderAddressCY);
  if (foundLabel.from_company) {
    doc
      .fontSize(10)
      .text(foundLabel.from_company.toUpperCase(), 8, senderAddressCY + 12);
    senderAddressCY = senderAddressCY + 12;
  }
  doc
    .fontSize(10)
    .text(foundLabel.from_address1.toUpperCase(), 8, senderAddressCY + 12);
  senderAddressCY = senderAddressCY + 12;

  if (foundLabel.from_address2) {
    doc
      .fontSize(10)
      .text(
        `${foundLabel.from_address2.toUpperCase()} ${foundLabel.from_zip}`,
        8,
        senderAddressCY + 12
      );
    senderAddressCY = senderAddressCY + 12;
  }

  // let sender_city_state_zip =
  //   foundLabel.from_city.toUpperCase() +
  //   " " +
  //   foundLabel.from_state.toUpperCase() +
  //   " " +
  //   foundLabel.from_zip;

  // doc.fontSize(10).text(sender_city_state_zip, 8, senderAddressCY + 12);

  // Add shipping data and weight information
  let formattedDate = formatDate(foundLabel.createdAt);

  let dateCY = 115;
  doc.fontSize(10).text(`Ship Date: ${formattedDate}`, 193, dateCY);
  dateCY = dateCY + 12;

  doc.fontSize(10).text(`Weight: ${foundLabel.weight} lb 0 oz`, 215, dateCY);
  dateCY = dateCY + 14;

  doc.fontSize(14).text("0001", 255, dateCY);

  // Add QR code
  let qrCodePng = await generateQRCode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );
  doc.image(qrCodePng, 8, 220, { width: 40, height: 40 });

  // Add to address
  // // Sender address
  let recAddressCY = 221;
  doc.fontSize(12).text(foundLabel.to_name.toUpperCase(), 55, recAddressCY);
  // if (foundLabel.to_company) {
  //   doc
  //     .fontSize(10)
  //     .text(foundLabel.to_company.toUpperCase(), 55, recAddressCY + 12);
  //   recAddressCY = recAddressCY + 12;
  // }

  doc
    .fontSize(12)
    .text(foundLabel.to_address1.toUpperCase(), 55, recAddressCY + 15);
  recAddressCY = recAddressCY + 15;

  // if (foundLabel.to_address2) {
  //   doc
  //     .fontSize(10)
  //     .text(foundLabel.to_address2.toUpperCase(), 55, recAddressCY + 12);
  //   recAddressCY = recAddressCY + 12;
  // }

  let receiver_city_state_zip =
    foundLabel.to_city.toUpperCase() +
    " " +
    foundLabel.to_state.toUpperCase() +
    " " +
    foundLabel.to_zip;

  doc.fontSize(12).text(receiver_city_state_zip, 55, recAddressCY + 15);

  doc.moveTo(0, 280).lineTo(288, 280).stroke();

  doc.fontSize(12).text("USPS TRACKING # EP", 92, 290);

  // Add barcode image
  let barCodePng = await generateBarCode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );

  doc.image(barCodePng, 30, 300, { width: 230, height: 55 });

  doc
    .fontSize(12)
    .text(formatTrackingNumber(`${foundLabel.trackingID}`), 72, 365);

  doc.moveTo(0, 380).lineTo(288, 380).stroke();

  doc.fontSize(10).text(foundLabel.note, 10, 390);

  // add qr code again.
  doc.image(qrCodePng, 230, 390, { width: 40, height: 40 });

  doc.end();
  console.log("generated rollo label check ... outputs/rollo.pdf");
}

module.exports = generateRolloPDF;
