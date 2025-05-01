const PDFDocument = require("pdfkit");
const fs = require("fs");
const { foundLabel } = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const { generateNewBarcode } = require("../utils/new-barcode_fun.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const { formatDate } = require("../utils/format-date.js");

async function generateUSPSPriorityMailPDF() {
  try {
    console.log("generating usps priority mail label pdf... >>>>>>>>>>>>");

    // Create a new PDF document
    const doc = new PDFDocument({
      size: [288, 445], // Adjust size as necessary
      margin: 0,
    });

    let pdfNamePath = `./assets/pdfs/usps-priority-mail.pdf`;
    // let pdfNamePath = `./assets/pdfs/${foundlabel.trackingID}-usps-priority-mail.pdf`;
    // Output to a file
    doc.pipe(fs.createWriteStream(pdfNamePath));

    const fontBold = "fonts/arial_bold.TTF";
    const fontRegular = "fonts/Arial.ttf";

    doc.font(fontBold);

    let tag = "P";
    doc.fontSize(60).text(tag, 20, 7);

    // Draw vertical line
    doc.moveTo(80, 0).lineTo(80, 80).stroke();

    // Define the position and dimensions of the box
    const boxX = 180;
    const boxY = 10;
    const boxWidth = 90;
    const boxHeight = 60;

    // Draw the box (a rectangle)
    doc.rect(boxX, boxY, boxWidth, boxHeight).stroke(); // `stroke()` draws the border, `fillAndStroke()` will fill and then draw the border
    doc.font(fontRegular);
    // Position the text inside the box
    doc.fontSize(10).text("U.S.", boxX + 35, boxY + 11);
    doc.fontSize(10).text("POSTAGE", boxX + 23, boxY + 24);
    doc.fontSize(10).text("PAID", boxX + 33, boxY + 36);

    // Draw line above shipping service name
    doc.moveTo(0, 80).lineTo(288, 80).stroke();

    doc.font(fontBold).fontSize(22).text("USPS PRIORITY MAIL ®", 20, 83);
    doc.moveTo(0, 110).lineTo(288, 110).stroke();

    // // Sender address
    let senderAddressCY = 115;
    let senderFontSize = 8;
    let senderGap = 10;
    doc.font(fontRegular);
    doc
      .fontSize(senderFontSize)
      .text(foundLabel.from_name.toUpperCase(), 8, senderAddressCY);
    senderAddressCY += senderGap;

    if (foundLabel.from_company) {
      doc
        .fontSize(senderFontSize)
        .text(foundLabel.from_company.toUpperCase(), 8, senderAddressCY);
      senderAddressCY += senderGap;
    }

    let combineAddress = `${foundLabel.from_address1
      .toUpperCase()
      .trim()} ${foundLabel.from_address2.toUpperCase().trim()}`;

    console.log("combineAddress length", combineAddress.length);
    doc
      .fontSize(senderFontSize)
      .text(combineAddress, 8, senderAddressCY, { width: 180 });
    senderAddressCY += senderGap;
    if (combineAddress.length > 30) {
      senderAddressCY += senderGap;
    }

    let sender_city_state_zip =
      foundLabel.from_city.toUpperCase().trim() +
      " " +
      foundLabel.from_state.toUpperCase().trim() +
      " " +
      foundLabel.from_zip;

    doc
      .fontSize(senderFontSize)
      .text(sender_city_state_zip, 8, senderAddressCY);

    doc.font(fontBold).fontSize(11).text(`0004`, 245, 130);

    const box2X = 240;
    const box2Y = 150;
    const box2Width = 35;
    const box2Height = 16;

    // Draw the box (a rectangle)
    doc.rect(box2X, box2Y, box2Width, box2Height).stroke();
    let code = generateCode();
    doc
      .font(fontBold)
      .fontSize(12)
      .text(code, box2X + 3, box2Y + 1);

    // Add QR code
    let qrCodePng = await generateQRCode(
      foundLabel.trackingID,
      foundLabel.to_zip
    );
    if (!qrCodePng) {
      return null;
    }

    doc.font(fontRegular).fontSize(9).text("SHIP TO:", 11, 200);
    doc.image(qrCodePng, 15, 220, { width: 35, height: 35 });

    // Add to address
    // // Sender address
    let recAddressCY = 200;
    let recAddressCX = 60;
    let recFontSize = 10;
    let recGap = 12;

    doc
      .font(fontRegular)
      .fontSize(recFontSize)
      .text(foundLabel.to_name.toUpperCase(), recAddressCX, recAddressCY);
    recAddressCY += recGap;

    if (foundLabel.to_company) {
      doc
        .fontSize(recFontSize)
        .text(foundLabel.to_company.toUpperCase(), recAddressCX, recAddressCY);
      recAddressCY += recGap;
    }

    let combineToAddress = `${foundLabel.from_address1
      .toUpperCase()
      .trim()} ${foundLabel.from_address2.toUpperCase().trim()}`;

    doc
      .fontSize(recFontSize)
      .text(combineToAddress, recAddressCX, recAddressCY, { width: 180 });
    recAddressCY += recGap;

    if (combineToAddress.length > 30) {
      recAddressCY += recGap;
    }

    let receiver_city_state_zip =
      foundLabel.to_city.toUpperCase() +
      " " +
      foundLabel.to_state.toUpperCase() +
      " " +
      foundLabel.to_zip;

    doc
      .fontSize(recFontSize)
      .text(receiver_city_state_zip, recAddressCX, recAddressCY);

    doc.moveTo(0, 280).lineTo(288, 280).stroke();
    doc.moveTo(0, 281).lineTo(288, 281).stroke();

    doc.font(fontBold).fontSize(11).text("USPS TRACKING #", 92, 285);

    // Add barcode image
    let barCodePng = await generateNewBarcode(
      foundLabel.trackingID,
      foundLabel.to_zip
    );

    if (!barCodePng) {
      return null;
    }
    doc.image(barCodePng, 23, 305, { height: 60, width: 240 });

    doc
      .font(fontBold)
      .fontSize(10)
      .text(formatTrackingNumber(`${foundLabel.trackingID}`), 72, 375);

    doc.moveTo(0, 390).lineTo(288, 390).stroke();
    doc.moveTo(0, 391).lineTo(288, 391).stroke();

    doc.font(fontRegular).fontSize(10).text(foundLabel.note, 9, 400);

    // add qr code again.
    doc.image(qrCodePng, 240, 400, { width: 35, height: 35 });

    doc.end();
    console.log(`generated rollo label check ... ${pdfNamePath}`);
    // reutn path of generated pdf file
    return pdfNamePath;
  } catch (error) {
    console.log("Error in generating usps priority mail pdf..", error);
    return null;
  }
}

function generateCode() {
  const prefix = Math.random() < 0.5 ? "C" : "R";
  const randomTwoDigits = Math.floor(Math.random() * 100); // 0 to 99
  const paddedDigits = String(randomTwoDigits).padStart(2, "0"); // ensures 2 digits
  return `${prefix}0${paddedDigits}`;
}

module.exports = generateUSPSPriorityMailPDF;