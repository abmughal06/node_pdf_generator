const PDFDocument = require("pdfkit");
const fs = require("fs");
const foundLabel = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
// const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const { formatDate } = require("../utils/format-date.js");
const generateNewBarcode = require("../utils/new-barcode_fun.js");

async function generateEasypostPremiumPDF() {
  try {
    console.log("generating Easypost Premium NEW label pdf... >>>>>>>>>>>>");

    // Create a new PDF document
    const doc = new PDFDocument({
      size: [288, 450], // Adjust size as necessary
      margin: 0,
    });

    let pdfNamePath = `./assets/pdfs/easypost-premium.pdf`;
    // Output to a file
    doc.pipe(fs.createWriteStream(pdfNamePath));

    doc.font("./fonts/prisma-sans-bold.ttf");

    let isGroundAdvantage = foundLabel.shippingService
      .toLowerCase()
      .includes("ground advantage");

    let tag = "P";
    // Draw the "P" and other texts
    if (isGroundAdvantage) {
      tag = "G";
    }
    doc.fontSize(70).text(tag, 10, -5);

    // Draw vertical line
    doc.moveTo(75, 0).lineTo(75, 90).stroke();

    // Define the position and dimensions of the box
    const boxX = isGroundAdvantage ? 140 : 180;
    const boxY = 12;
    const boxWidth = isGroundAdvantage ? 130 : 90;
    const boxHeight = 50;

    // Draw the box (a rectangle)
    doc.rect(boxX, boxY, boxWidth, boxHeight).stroke(); // `stroke()` draws the border, `fillAndStroke()` will fill and then draw the border

    // Position the text inside the box
    doc
      .fontSize(8)
      .text(
        isGroundAdvantage ? "USPS GROUND ADVANTAGE" : "PRIORITY MAIL",
        isGroundAdvantage ? boxX + 3 : boxX + 12,
        boxY + 5
      );
    doc
      .fontSize(8)
      .text(
        "U.S. POSTAGE PAID",
        isGroundAdvantage ? boxX + 23 : boxX + 2,
        boxY + 15
      );
    doc
      .fontSize(8)
      .text("EASYPOST", isGroundAdvantage ? boxX + 43 : boxX + 20, boxY + 25);
    doc
      .fontSize(8)
      .text("eVS", isGroundAdvantage ? boxX + 58 : boxX + 35, boxY + 35);

    // Draw line above shipping service name
    doc.moveTo(0, 90).lineTo(288, 90).stroke();

    // // Draw Priority Mail/Ground Advantage text
    doc
      .fontSize(isGroundAdvantage ? 14 : 14)
      .text(
        isGroundAdvantage ? "USPS GROUND ADVANTAGE" : "USPS PRIORITY MAIL",
        isGroundAdvantage ? 33 : 60,
        isGroundAdvantage ? 92 : 92
      );

    if (isGroundAdvantage) {
      doc.fontSize(9).text("TM", 252, 93);
    }
    // Draw line below shipping service name
    doc.moveTo(0, 113).lineTo(288, 113).stroke();

    doc.font("./fonts/prisma-sans-roman.ttf");

    // // Sender address
    let senderAddressCY = 120;
    doc
      .fontSize(9)
      .text(foundLabel.from_name.toUpperCase(), 8, senderAddressCY);
    if (foundLabel.from_company) {
      doc
        .fontSize(9)
        .text(foundLabel.from_company.toUpperCase(), 8, senderAddressCY + 11);
      senderAddressCY = senderAddressCY + 11;
    }
    doc
      .fontSize(9)
      .text(foundLabel.from_address1.toUpperCase(), 8, senderAddressCY + 11);
    senderAddressCY = senderAddressCY + 11;

    if (foundLabel.from_address2) {
      doc.fontSize(9).text(
        // `${foundLabel.from_address2.toUpperCase()} ${foundLabel.from_zip}`,
        `${foundLabel.from_address2.toUpperCase()}`,
        8,
        senderAddressCY + 11
      );
      senderAddressCY = senderAddressCY + 11;
    }

    let sender_city_state_zip =
      foundLabel.from_city.toUpperCase() +
      " " +
      foundLabel.from_state.toUpperCase() +
      " " +
      foundLabel.from_zip;

    doc.fontSize(9).text(sender_city_state_zip, 8, senderAddressCY + 11);

    // Add shipping data and weight information
    doc
      .fontSize(9)
      .text(`Ship Date: ${formatDate(foundLabel.createdAt)}`, 177, 120);
    doc.fontSize(9).text(`Weight: ${foundLabel.weight} lbs`, 220, 137);
    doc
      .fontSize(9)
      .text(
        `Dimensions: ${foundLabel.length}x${foundLabel.width}x${foundLabel.height}`,
        175,
        150
      );

    doc.fontSize(8).text("SHIP TO: ", 11, 190);

    // Add QR code
    let qrCodePng = await generateQRCode(
      foundLabel.trackingID,
      foundLabel.to_zip
    );
    doc.image(qrCodePng, 11, 205, { width: 30, height: 30 });

    let shiptodetailx = 55;

    // Add to address
    // // Sender address
    let recAddressCY = 190;
    doc
      .fontSize(9)
      .text(foundLabel.to_name.toUpperCase(), shiptodetailx, recAddressCY);
    if (foundLabel.to_company) {
      doc
        .fontSize(9)
        .text(
          foundLabel.to_company.toUpperCase(),
          shiptodetailx,
          recAddressCY + 12
        );
      recAddressCY = recAddressCY + 12;
    }

    doc
      .fontSize(9)
      .text(
        foundLabel.to_address1.toUpperCase(),
        shiptodetailx,
        recAddressCY + 12
      );
    recAddressCY = recAddressCY + 12;

    if (foundLabel.to_address2) {
      doc
        .fontSize(9)
        .text(
          foundLabel.to_address2.toUpperCase(),
          shiptodetailx,
          recAddressCY + 12
        );
      recAddressCY = recAddressCY + 12;
    }

    let receiver_city_state_zip =
      foundLabel.to_city.toUpperCase() +
      " " +
      foundLabel.to_state.toUpperCase() +
      " " +
      foundLabel.to_zip;

    doc
      .fontSize(11)
      .text(receiver_city_state_zip, shiptodetailx, recAddressCY + 12);

    doc.moveTo(0, 290).lineTo(288, 290).stroke();
    doc.moveTo(0, 291).lineTo(288, 291).stroke();
    doc.moveTo(0, 292).lineTo(288, 292).stroke();

    doc.font("./fonts/prisma-sans-bold.ttf");

    doc.fontSize(10).text("USPS TRACKING # EP", 85, 295);

    // Add barcode image
    let barCodePng = await generateNewBarcode(
      foundLabel.trackingID,
      foundLabel.to_zip
    );

    doc.image(barCodePng, 16, 313, { height: 58, width: 258 });

    doc
      .fontSize(10)
      .text(formatTrackingNumber(`${foundLabel.trackingID}`), 57, 375);

    doc.moveTo(0, 395).lineTo(288, 395).stroke();
    doc.moveTo(0, 396).lineTo(288, 396).stroke();
    doc.moveTo(0, 397).lineTo(288, 397).stroke();

    doc.image("./assets/easypost-premium-assets/easypost.png", 85, 402, {
      height: 30,
    });
    doc.image(qrCodePng, 245, 405, { width: 30, height: 30 });

    doc.end();
    console.log(
      `generated Easypost premium new label check ... ${pdfNamePath}`
    );
    // reutn path of generated pdf file
    return pdfNamePath;
  } catch (error) {
    console.log("Error in generating shippo new pdf..", error);
    return null;
  }
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

module.exports = generateEasypostPremiumPDF;
