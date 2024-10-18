const PDFDocument = require("pdfkit");
const fs = require("fs");
const foundLabel = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const formatDate = require("../utils/format-date.js");

async function generateATFMPDF() {
  try {
    console.log("generating atfm label pdf... >>>>>>>>>>>>");

    // Create a new PDF document
    const doc = new PDFDocument({
      size: [288, 425], // Adjust size as necessary
      margin: 0,
    });

    let pdfNamePath = `./assets/pdfs/${foundLabel.trackingID}-atfm.pdf`;
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
    const boxWidth = isGroundAdvantage ? 130 : 100;
    const boxHeight = 50;

    // Draw the box (a rectangle)
    doc.rect(boxX, boxY, boxWidth, boxHeight).stroke(); // `stroke()` draws the border, `fillAndStroke()` will fill and then draw the border

    // Position the text inside the box
    doc
      .fontSize(8)
      .text(
        isGroundAdvantage ? "USPS GROUND ADVANTAGE" : "PRIORITY MAIL",
        isGroundAdvantage ? boxX + 3 : boxX + 15,
        boxY + 5
      );
    doc
      .fontSize(8)
      .text(
        "U.S. POSTAGE PAID",
        isGroundAdvantage ? boxX + 23 : boxX + 5,
        boxY + 15
      );
    doc
      .fontSize(8)
      .text("ATFM", isGroundAdvantage ? boxX + 55 : boxX + 35, boxY + 25);
    doc
      .fontSize(8)
      .text("ePostage", isGroundAdvantage ? boxX + 45 : boxX + 25, boxY + 35);

    // Draw line above shipping service name
    doc.moveTo(0, 80).lineTo(288, 80).stroke();

    // // Draw Priority Mail/Ground Advantage text
    doc
      .fontSize(isGroundAdvantage ? 17 : 20)
      .text(
        isGroundAdvantage ? "GROUND ADVANTAGE" : "USPS PRIORITY MAIL®",
        isGroundAdvantage ? 35 : 20,
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
      .fontSize(8)
      .text(foundLabel.from_name.toUpperCase(), 8, senderAddressCY);
    if (foundLabel.from_company) {
      doc
        .fontSize(8)
        .text(foundLabel.from_company.toUpperCase(), 8, senderAddressCY + 10);
      senderAddressCY = senderAddressCY + 10;
    }
    doc
      .fontSize(8)
      .text(foundLabel.from_address1.toUpperCase(), 8, senderAddressCY + 10);
    senderAddressCY = senderAddressCY + 10;

    if (foundLabel.from_address2) {
      doc.fontSize(8).text(
        // `${foundLabel.from_address2.toUpperCase()} ${foundLabel.from_zip}`,
        `${foundLabel.from_address2.toUpperCase()}`,
        8,
        senderAddressCY + 10
      );
      senderAddressCY = senderAddressCY + 10;
    }

    let sender_city_state_zip =
      foundLabel.from_city.toUpperCase() +
      " " +
      foundLabel.from_state.toUpperCase() +
      " " +
      foundLabel.from_zip;

    doc.fontSize(8).text(sender_city_state_zip, 8, senderAddressCY + 10);

    // Add shipping data and weight information
    doc.fontSize(8).text(`Mailed From ${foundLabel.from_zip}`, 205, 120);
    doc.fontSize(8).text(`WT : ${foundLabel.weight} lbs`, 235, 130);

    // Add QR code
    let qrCodePng = await generateQRCode(
      foundLabel.trackingID,
      foundLabel.to_zip
    );

    let shiptox = 30;
    let shiptodetailx = 30 + 40;

    doc.fontSize(10).text("SHIP\nTO:", shiptox, 200);

    // Add to address
    // // Sender address
    let recAddressCY = 200;
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

    doc.moveTo(0, 280).lineTo(288, 280).stroke();

    doc.font("./fonts/prisma-sans-bold.ttf");

    doc.fontSize(10).text("USPS TRACKING # - EP", 80, 285);

    // Add barcode image
    let barCodePng = await generateBarCode(
      foundLabel.trackingID,
      foundLabel.to_zip
    );

    if (!barCodePng) {
      return null;
    }
    console.log("barCodePng", barCodePng);
    doc.image(barCodePng, 16, 300, { height: 58, width: 258 });

    doc
      .fontSize(11)
      .text(formatTrackingNumber(`${foundLabel.trackingID}`), 52, 360);

    doc.moveTo(0, 380).lineTo(288, 380).stroke();

    doc
      .font("./fonts/prisma-sans-roman.ttf")
      .fontSize(8)
      .text(foundLabel.note, 10, 390, { width: 270 });

    // add qr code again.
    // doc.image(qrCodePng, 230, 390, { width: 40, height: 40 });

    doc.end();
    console.log(`generated atfm label check ... ${pdfNamePath}`);
    // reutn path of generated pdf file
    return pdfNamePath;
  } catch (error) {
    console.log("Error in generating atfm pdf..", error);
    return null;
  }
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

module.exports = generateATFMPDF;
