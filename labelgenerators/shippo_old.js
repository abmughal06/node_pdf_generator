const PDFDocument = require("pdfkit");
const fs = require("fs");
const foundLabel = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const { formatDate } = require("../utils/format-date.js");
const generateNewBarcode = require("../utils/new-barcode_fun.js");

async function generateShippoOldPDF() {
  try {
    console.log("generating Shippo OLD label pdf... >>>>>>>>>>>>");

    // Create a new PDF document
    const doc = new PDFDocument({
      size: [288, 440], // Adjust size as necessary
      margin: 0,
    });

    let pdfNamePath = `./assets/pdfs/${foundLabel.trackingID}-shippo-old.pdf`;
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
    doc.fontSize(65).text(tag, 18, -5);

    // Draw vertical line
    doc.moveTo(90, 0).lineTo(90, 80).stroke();

    // Define the position and dimensions of the box
    const boxX = isGroundAdvantage ? 140 : 160;
    const boxY = 17;
    const boxWidth = isGroundAdvantage ? 130 : 110;
    const boxHeight = 50;

    // Draw the box (a rectangle)
    doc.rect(boxX, boxY, boxWidth, boxHeight).stroke(); // `stroke()` draws the border, `fillAndStroke()` will fill and then draw the border

    // Position the text inside the box
    doc
      .fontSize(8)
      .text(
        isGroundAdvantage ? "USPS GROUND ADVANTAGE" : "PRIORITY MAIL",
        isGroundAdvantage ? boxX + 3 : boxX + 20,
        boxY + 5
      );
    doc
      .fontSize(8)
      .text(
        "U.S. POSTAGE PAID",
        isGroundAdvantage ? boxX + 23 : boxX + 10,
        boxY + 15
      );
    doc
      .fontSize(8)
      .text("Shippo", isGroundAdvantage ? boxX + 55 : boxX + 40, boxY + 25);
    doc
      .fontSize(8)
      .text("ePostage", isGroundAdvantage ? boxX + 45 : boxX + 35, boxY + 35);

    // Draw line above shipping service name
    doc.moveTo(0, 80).lineTo(288, 80).stroke();

    // // Draw Priority Mail/Ground Advantage text
    doc
      .fontSize(isGroundAdvantage ? 17 : 20)
      .text(
        isGroundAdvantage ? "GROUND ADVANTAGE" : "USPS PRIORITY MAIL",
        isGroundAdvantage ? 35 : 25,
        isGroundAdvantage ? 85 : 82
      );

    if (isGroundAdvantage) {
      doc.fontSize(10).text("TM", 240, 84);
    }
    // Draw line below shipping service name
    doc.moveTo(0, 110).lineTo(288, 110).stroke();

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
    doc.fontSize(9).text(`Weight : ${foundLabel.weight} lbs`, 216, 132);
    doc
      .fontSize(9)
      .text(
        `Dimensions : ${foundLabel.length} x ${foundLabel.width} x ${foundLabel.height}`,
        159,
        143
      );

    // Add QR code

    let shiptodetailx = 40;

    // Add to address
    // // Sender address
    let recAddressCY = 215;
    doc
      .fontSize(10)
      .text(foundLabel.to_name.toUpperCase(), shiptodetailx, recAddressCY);
    if (foundLabel.to_company) {
      doc
        .fontSize(10)
        .text(
          foundLabel.to_company.toUpperCase(),
          shiptodetailx,
          recAddressCY + 12
        );
      recAddressCY = recAddressCY + 12;
    }

    doc
      .fontSize(10)
      .text(
        foundLabel.to_address1.toUpperCase(),
        shiptodetailx,
        recAddressCY + 12
      );
    recAddressCY = recAddressCY + 12;

    if (foundLabel.to_address2) {
      doc
        .fontSize(10)
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
      .fontSize(10)
      .text(receiver_city_state_zip, shiptodetailx, recAddressCY + 12);

    doc.moveTo(0, 290).lineTo(288, 290).stroke();

    doc.font("./fonts/prisma-sans-bold.ttf");

    doc.fontSize(10).text("USPS TRACKING # EP", 85, 295);

    // Add barcode image
    let barCodePng = generateNewBarcode(
      foundLabel.trackingID,
      foundLabel.to_zip
    );

    if (!barCodePng) {
      return null;
    }
    console.log("barCodePng", barCodePng);
    doc.image(barCodePng, 16, 310, { height: 58, width: 258 });

    doc
      .fontSize(10)
      .text(formatTrackingNumber(`${foundLabel.trackingID}`), 58, 370);

    doc.moveTo(0, 390).lineTo(288, 390).stroke();

    doc.image("./assets/shippo_logo.png", 100, 400, { height: 32 });

    doc.end();
    console.log(`generated shippo old label check ... ${pdfNamePath}`);
    // reutn path of generated pdf file
    return pdfNamePath;
  } catch (error) {
    console.log("Error in generating shippo old pdf..", error);
    return null;
  }
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

module.exports = generateShippoOldPDF;
