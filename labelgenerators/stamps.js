const PDFDocument = require("pdfkit");
const fs = require("fs");
const { foundLabel } = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
// const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const { formatDate } = require("../utils/format-date.js");
const { generateNewBarcode } = require("../utils/new-barcode_fun.js");
const { getZone2 } = require("../utils/zone_function.js");
const { generatePdf417Barcode } = require("../utils/pdf417_barcode.js");

async function generateStampsPDF() {
  console.log("generating Stamps NEW label pdf... >>>>>>>>>>>>");

  // Create a new PDF document
  const doc = new PDFDocument({
    size: [335, 490], // Adjust size as necessary
    margin: 0,
  });

  let pdfNamePath = `./assets/pdfs/stamps.pdf`;
  // Output to a file
  doc.pipe(fs.createWriteStream(pdfNamePath));

  let fontBold = "fonts/arial_bold.ttf";
  let fontRegular = "fonts/Arial.ttf";

  const borderX = 10;
  const borderY = 10;
  const borderWidth = 315;
  const borderHeight = 470;

  // Draw the box (a rectangle)
  doc.rect(borderX, borderY, borderWidth, borderHeight).stroke();
  //   let isGroundAdvantage = foundLabel.shippingService
  //     .toLowerCase()
  //     .includes("ground advantage");

  //   if (isGroundAdvantage) {
  //     doc.font(fontBold).fontSize(80).text("G", 18, 5);
  //   } else {
  //     doc.font(fontBold).fontSize(80).text("P", 22, 6);
  //   }

  doc.font(fontBold).fontSize(80).text("P", 23, 6);

  // Draw vertical line
  doc.moveTo(90, 10).lineTo(90, 90).stroke();

  let threeRandomDigit = generateThreeRandomNumbers();

  let zone = getZone2(
    foundLabel.from_state.toString(),
    foundLabel.to_state.toString()
  );

  let fontSizeUpperText = 7;
  let SpaceYUpperText = 13;
  let SpaceXUpperText = 95;

  doc
    .fontSize(fontSizeUpperText + 1)
    .text("US POSTAGE AND FEES PAID IMI", SpaceXUpperText, SpaceYUpperText);
  SpaceYUpperText += 10;
  doc
    .font(fontRegular)
    .fontSize(fontSizeUpperText)
    .text(
      `${foundLabel.weight} LB PRIORITY MAIL RATE`,
      SpaceXUpperText,
      SpaceYUpperText
    );
  SpaceYUpperText += 9;

  doc
    .fontSize(fontSizeUpperText)
    .text(`ZONE ${zone} NO SURCHARGE`, SpaceXUpperText, SpaceYUpperText);
  SpaceYUpperText += 9;

  doc
    .fontSize(fontSizeUpperText)
    .text("Commercial", SpaceXUpperText, SpaceYUpperText);
  SpaceYUpperText += 11;

  let pdf417Barcode = await generatePdf417Barcode();
  doc.image(pdf417Barcode, 95, SpaceYUpperText, { width: 150 });

  //   doc
  //     .fontSize(fontSizeUpperText)
  //     .text("C6592937", SpaceXUpperText, SpaceYUpperText);
  //   SpaceYUpperText += 11;

  //   doc
  //     .fontSize(fontSizeUpperText)
  //     .text(
  //       `${foundLabel.weight} LB ZONE ${zone}`,
  //       SpaceXUpperText,
  //       SpaceYUpperText
  //     );

  //   right side text
  doc.fontSize(8).text("06350014476731", 258, 13);
  doc.fontSize(8).text("20587694", 284, 24);
  doc.fontSize(8).text(`FROM ${foundLabel.from_zip.split("-")[0]}`, 272, 36);
  doc.image("./assets/stamps.png", 275, 55, {width: 45});
  doc.fontSize(8).text(`${formatDate(foundLabel.createdAt)}`, 280, 76);
  

  //   // Draw line above shipping service name
  doc.moveTo(10, 90).lineTo(325, 90).stroke();

  // Draw Priority Mail/Ground Advantage text
  //   if (isGroundAdvantage) {
  //     doc.font(fontRegular).fontSize(15).text("USPS GROUND ADVANTAGE", 60, 94);
  //     doc.font(fontRegular).fontSize(8).text("TM", 268, 95);
  //   } else {
  //     doc.font(fontRegular).fontSize(15).text("USPS PRIORITY MAIL", 85, 94);
  //   }

  doc.font(fontBold).fontSize(20).text("USPS PRIORITY MAIL ®", 55, 92);

  // Draw line below shipping service name
  doc.moveTo(10, 115).lineTo(325, 115).stroke();

  // // Sender address
  let senderAddressCY = 120;
  let senderAddressCX = 15;

  doc.font(fontRegular)
    .fontSize(10)
    .text(foundLabel.from_name.toUpperCase(), senderAddressCX, senderAddressCY);
  senderAddressCY += 12;
  if (foundLabel.from_company) {
    doc
      .fontSize(10)
      .text(
        foundLabel.from_company.toUpperCase(),
        senderAddressCX,
        senderAddressCY
      );
    senderAddressCY += 12;
  }

  let combineAddress = `${foundLabel.from_address1
    .toUpperCase()
    .trim()} ${foundLabel.from_address2.toUpperCase().trim()}`;

  console.log("combineAddress length", combineAddress.length);
  doc
    .fontSize(10)
    .text(combineAddress, senderAddressCX, senderAddressCY, { width: 180 });
  senderAddressCY += 12;
  if (combineAddress.length > 30) {
    senderAddressCY += 12;
  }

  let sender_city_state_zip =
    foundLabel.from_city.toUpperCase() +
    " " +
    foundLabel.from_state.toUpperCase() +
    " " +
    foundLabel.from_zip;

  doc.fontSize(10).text(sender_city_state_zip, senderAddressCX, senderAddressCY);

  // Add shipping data and weight information

  let ran = generateRandomOneToNine();
  doc.font(fontBold).fontSize(14).text(`000${ran}`, 288, 120);

//   const boxX = 240;
//   const boxY = 160;
//   const boxWidth = 37;
//   const boxHeight = 18;

//   // Draw the box (a rectangle)
//   let ran2 = generateRandomElevenToNinetyNine();
//   doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();
//   doc
//     .font(fontRegular)
//     .fontSize(10)
//     .text(`CO${ran2}`, boxX + 6, boxY + 4);

  // Add QR code
  let qrCodePng = await generateQRCode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );
  if (!qrCodePng) {
    return null;
  }
  doc.font(fontBold).fontSize(9).text("SHIP\nTO:", 18, 220);
  doc.image(qrCodePng, 18, 250, {
    width: 30,
    height: 30,
  });

  // Add to address
  // // Sender address
  let recAddressCY = 218;
  let recAddressCX = 60;
  doc
    .font(fontRegular)
    .fontSize(11)
    .text(foundLabel.to_name.toUpperCase(), recAddressCX, recAddressCY);
  recAddressCY += 13;
  if (foundLabel.to_company) {
    doc
      .fontSize(11)
      .text(foundLabel.to_company.toUpperCase(), recAddressCX, recAddressCY);
    recAddressCY += 13;
  }

  let combineToAddress = `${foundLabel.to_address1
    .toUpperCase()
    .trim()} ${foundLabel.to_address2.toUpperCase().trim()}`;

  doc.fontSize(11).text(combineToAddress, recAddressCX, recAddressCY);
  recAddressCY += 13;

  if (combineToAddress.length > 40) {
    recAddressCY += 13;
  }

  let receiver_city_state_zip =
    foundLabel.to_city.toUpperCase() +
    " " +
    foundLabel.to_state.toUpperCase() +
    " " +
    foundLabel.to_zip;

  doc.fontSize(11).text(receiver_city_state_zip, recAddressCX, recAddressCY);

  doc.moveTo(10, 300).lineTo(325, 300).stroke();
  doc.moveTo(10, 301).lineTo(325, 301).stroke();
  doc.moveTo(10, 302).lineTo(325, 302).stroke();

  doc.font(fontBold).fontSize(13).text("USPS TRACKING #", 105, 310);

  // Add barcode image
  let barCodePng = await generateNewBarcode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );

  if (!barCodePng) {
    return null;
  }
  doc.image(barCodePng, 42.5, 330, { height: 64, width: 250 });

  doc
    .fontSize(14)
    .text(formatTrackingNumber(`${foundLabel.trackingID}`), 70, 400);

  doc.moveTo(10, 423).lineTo(325, 423).stroke();
  doc.moveTo(10, 424).lineTo(325, 424).stroke();
  doc.moveTo(10, 425).lineTo(325, 425).stroke();

  doc.font(fontRegular).fontSize(9).text(foundLabel.note, 20, 435, {width: 250});

  // add qr code again.
  doc.image(qrCodePng, 278, 435, { width: 35, height: 35 });

  doc.end();
  console.log(`generated stamps label check ... ${pdfNamePath}`);
  // reutn path of generated pdf file
  return pdfNamePath;
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

function generateThreeRandomNumbers() {
  const randomNum = Math.floor(Math.random() * 1000); // Generates a number between 0 and 999
  return String(randomNum).padStart(3, "0");
}

// 2. Function to generate a random number between 11 and 99
function generateRandomElevenToNinetyNine() {
  return Math.floor(Math.random() * (99 - 11 + 1)) + 11;
}

module.exports = generateStampsPDF;
