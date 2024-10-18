const PDFDocument = require("pdfkit");
const fs = require("fs");
const foundLabel = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const formatDateEasyPost = require("../utils/format-date.js");

async function generateEasyPostPDF() {
  try {
    console.log("generating easypost label pdf... >>>>>>>>>>>>");

    // Create a new PDF document
    const doc = new PDFDocument({
      size: [288, 445], // Adjust size as necessary
      margin: 0,
    });

    let pdfNamePath = `./assets/pdfs/${foundLabel.trackingID}-easypost.pdf`;
    // Output to a file
    doc.pipe(fs.createWriteStream(pdfNamePath));

    doc.font("fonts/Helvetica.ttf");

    let isGroundAdvantage = foundLabel.shippingService
      .toLowerCase()
      .includes("ground advantage");

    let tag = "P";
    // Draw the "P" and other texts
    if (isGroundAdvantage) {
      tag = "G";
    }
    doc.fontSize(60).text(tag, 20, 20);

    // Draw vertical line
    doc.moveTo(70, 0).lineTo(70, 80).stroke();

    let threeRandomDigit = generateThreeRandomNumbers();

    doc.fontSize(8).text("US POSTAGE AND FEES PAID", 80, 10);
    doc.fontSize(8).text(formatDateEasyPost(foundLabel.createdAt), 80, 20);
    doc.fontSize(8).text("90020", 80, 33);
    doc.fontSize(8).text("C4190745", 80, 43);
    doc.fontSize(8).text("Commercial", 80, 53);
    doc.fontSize(8).text(`${foundLabel.weight}.0 LB ZONE 6`, 80, 67);
    doc.fontSize(15).text("easypost", 220, 10);
    doc.image("./assets/easypost_fixed_barcode.png", 135, 30, { height: 30 });
    doc.fontSize(9).text(`0901000008${threeRandomDigit}`, 217, 65);

    // Draw line above shipping service name
    doc.moveTo(0, 80).lineTo(288, 80).stroke();

    // // Draw Priority Mail/Ground Advantage text
    doc
      .fontSize(isGroundAdvantage ? 17 : 20)
      .text(
        isGroundAdvantage ? "USPS GROUND ADVANTAGE" : "USPS PRIORITY MAIL",
        isGroundAdvantage ? 55 : 65,
        isGroundAdvantage ? 90 : 88
      );

    if (isGroundAdvantage) {
      doc.fontSize(8).text("TM", 238, 88);
    }
    // Draw line below shipping service name
    doc.moveTo(0, 110).lineTo(288, 110).stroke();

    // // Sender address
    let senderAddressCY = 118;
    doc
      .fontSize(10)
      .text(foundLabel.from_name.toUpperCase(), 8, senderAddressCY);
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
      doc.fontSize(10).text(
        // `${foundLabel.from_address2.toUpperCase()} ${foundLabel.from_zip}`,
        `${foundLabel.from_address2.toUpperCase()}`,
        8,
        senderAddressCY + 12
      );
      senderAddressCY = senderAddressCY + 12;
    }

    let sender_city_state_zip =
      foundLabel.from_city.toUpperCase() +
      " " +
      foundLabel.from_state.toUpperCase() +
      " " +
      foundLabel.from_zip;

    doc.fontSize(10).text(sender_city_state_zip, 8, senderAddressCY + 12);

    // Add shipping data and weight information

    let ran = generateRandomOneToNine();
    doc.fontSize(14).text(`000${ran}`, 254, 115);

    // Add QR code
    let qrCodePng = await generateQRCode(
      foundLabel.trackingID,
      foundLabel.to_zip
    );
    if (!qrCodePng) {
      return null;
    }
    doc.image(qrCodePng, 8, foundLabel.to_company ? 200 : 220, {
      width: 40,
      height: 40,
    });

    // Add to address
    // // Sender address
    let recAddressCY = foundLabel.to_company ? 200 : 221;
    doc.fontSize(12).text(foundLabel.to_name.toUpperCase(), 55, recAddressCY);
    if (foundLabel.to_company) {
      doc
        .fontSize(12)
        .text(foundLabel.to_company.toUpperCase(), 55, recAddressCY + 15);
      recAddressCY = recAddressCY + 15;
    }

    doc
      .fontSize(12)
      .text(foundLabel.to_address1.toUpperCase(), 55, recAddressCY + 15);
    recAddressCY = recAddressCY + 15;

    if (foundLabel.to_address2) {
      doc
        .fontSize(12)
        .text(foundLabel.to_address2.toUpperCase(), 55, recAddressCY + 15);
      recAddressCY = recAddressCY + 15;
    }

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

    if (!barCodePng) {
      return null;
    }
    console.log("barCodePng", barCodePng);
    doc.image(barCodePng, 16, 300, { height: 58, width: 258 });

    doc
      .fontSize(12)
      .text(formatTrackingNumber(`${foundLabel.trackingID}`), 72, 365);

    doc.moveTo(0, 380).lineTo(288, 380).stroke();

    doc.fontSize(10).text(foundLabel.note, 10, 390);

    // add qr code again.
    doc.image(qrCodePng, 230, 390, { width: 40, height: 40 });

    doc.end();
    console.log(`generated easypost label check ... ${pdfNamePath}`);
    // reutn path of generated pdf file
    return pdfNamePath;
  } catch (error) {
    console.log("Error in generating easypost pdf..", error);
    return null;
  }
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

function generateThreeRandomNumbers() {
  const randomNum = Math.floor(Math.random() * 1000); // Generates a number between 0 and 999
  return String(randomNum).padStart(3, "0");
}

module.exports = generateEasyPostPDF;
