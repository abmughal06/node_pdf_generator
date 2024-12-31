const PDFDocument = require("pdfkit");
const fs = require("fs");
const foundLabel = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const formatDate = require("../utils/format-date.js");
const generateNewBarcode = require("../utils/new-barcode_fun.js");

async function generateEVSPDF() {
  try {
    console.log("generating EVS label pdf... >>>>>>>>>>>>");

    // Create a new PDF document
    const doc = new PDFDocument({
      size: [288, 445], // Adjust size as necessary 445 height
      margin: 0,
    });

    let pdfNamePath = `./assets/pdfs/${foundLabel.trackingID}-evs.pdf`;
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
    doc.fontSize(75).text(tag, 18, -5);

    // Draw vertical line
    doc.moveTo(100, 0).lineTo(100, 100).stroke();

    // Define the position and dimensions of the box
    const boxX = isGroundAdvantage ? 180 : 160;
    const boxY = 17;
    const boxWidth = 90;
    const boxHeight = 40;

    // Draw the box (a rectangle)
    doc.rect(boxX, boxY, boxWidth, boxHeight).stroke(); // `stroke()` draws the border, `fillAndStroke()` will fill and then draw the border

    // Position the text inside the box
    doc
      .font("./fonts/prisma-sans-roman.ttf")
      .fontSize(8)
      .text("U.S. POSTAGE PAID", boxX + 5, boxY + 5);
    doc.fontSize(8).text("PERMIT NO. 49493", boxX + 5, boxY + 15);
    doc.fontSize(8).text("eVS", boxX + 5, boxY + 25);

    // Draw line above shipping service name
    doc.moveTo(0, 100).lineTo(288, 100).stroke();
    doc.font("./fonts/prisma-sans-bold.ttf");

    // // Draw Priority Mail/Ground Advantage text
    doc
      .fontSize(isGroundAdvantage ? 17 : 20)
      .text(
        isGroundAdvantage ? "GROUND ADVANTAGE" : "PRIORITY MAIL®",
        isGroundAdvantage ? 35 : 55,
        isGroundAdvantage ? 105 : 102
      );

    if (isGroundAdvantage) {
      doc.fontSize(10).text("TM", 240, 104);
    }
    // Draw line below shipping service name
    doc.moveTo(0, 130).lineTo(288, 130).stroke();

    doc.font("./fonts/prisma-sans-roman.ttf");

    // // Sender address
    let senderAddressCY = 140;
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
    doc.fontSize(8).text(formatDate(foundLabel.createdAt), 220, 140);
    doc.fontSize(8).text(`Mailed from ${foundLabel.from_zip}`, 202, 150);
    doc.fontSize(8).text(`${foundLabel.weight} lbs 0 ozs`, 233, 160);

    // Add QR code
    let shiptodetailx = 40;

    // doc.fontSize(10).text("SHIP\nTO:", shiptox, 220);

    // Add to address
    // // Sender address
    let recAddressCY = 220;
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

    doc.moveTo(0, 300).lineTo(288, 300).stroke();

    doc.font("./fonts/prisma-sans-bold.ttf");

    doc.fontSize(10).text("USPS TRACKING # eVS", 80, 305);

    // Add barcode image
    let barCodePng = generateNewBarcode(
      foundLabel.trackingID,
      foundLabel.to_zip
    );

    if (!barCodePng) {
      return null;
    }
    doc.image(barCodePng, 16, 320, { height: 58, width: 258 });

    // let barCodePng2 = await generateBarCode(
    //   foundLabel.trackingID,
    //   foundLabel.to_zip
    // );

    // doc.image(barCodePng2, 20, 385, { height: 50, width: 250 });

    doc
      .fontSize(11)
      .text(formatTrackingNumber(`${foundLabel.trackingID}`), 52, 380);

    doc.moveTo(0, 400).lineTo(288, 400).stroke();

    doc
      .font("./fonts/prisma-sans-roman.ttf")
      .fontSize(8)
      .text(foundLabel.note, 10, 410, { width: 270 });

    doc.end();
    console.log(`generated evs label check ... ${pdfNamePath}`);
    // reutn path of generated pdf file
    return pdfNamePath;
  } catch (error) {
    console.log("Error in generating evs pdf..", error);
    return null;
  }
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

module.exports = generateEVSPDF;
