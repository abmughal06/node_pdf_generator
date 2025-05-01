const PDFDocument = require("pdfkit");
const fs = require("fs");
const { foundLabel } = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
// const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const {
  formatDateEasyPostPremium,
} = require("../utils/format-date.js");
const { generateNewBarcode } = require("../utils/new-barcode_fun.js");
const { getZone2 } = require("../utils/zone_function.js");

async function generateEasypostPremiumPDF() {
  console.log("generating Easypost Premium NEW label pdf... >>>>>>>>>>>>");

  // Create a new PDF document
  const doc = new PDFDocument({
    size: [305, 465], // Adjust size as necessary
    margin: 0,
  });

  let pdfNamePath = `./assets/pdfs/easypost-premium.pdf`;
  // Output to a file
  doc.pipe(fs.createWriteStream(pdfNamePath));

  let fontBold = "fonts/arial_bold.ttf";
  let fontRegular = "fonts/Arial.ttf";
  let fontMedium = "fonts/RobotoCondensed-Medium.ttf";

  let tag = "P";

  doc.font(fontBold).fontSize(75).text(tag, 10, 0);

  // Draw vertical line
  doc.moveTo(70, 0).lineTo(70, 80).stroke();

  let threeRandomDigit = generateThreeRandomNumbers();

  let zone = getZone2(
    foundLabel.from_state.toString(),
    foundLabel.to_state.toString()
  );

  let fontSizeUpperText = 8;
  let SpaceXUpperText = 8;

  doc.fontSize(9).text("US POSTAGE AND FEES PAID", 80, SpaceXUpperText);
  SpaceXUpperText += 12;
  doc
    .font(fontRegular)
    .fontSize(fontSizeUpperText)
    .text(formatDateEasyPostPremium(foundLabel.createdAt), 80, SpaceXUpperText);
  SpaceXUpperText += 11;

  doc
    .fontSize(fontSizeUpperText)
    .text(foundLabel.from_zip.split("-")[0], 80, SpaceXUpperText);
  SpaceXUpperText += 11;

  doc.fontSize(fontSizeUpperText).text("C6592937", 80, SpaceXUpperText);
  SpaceXUpperText += 11;

  doc.fontSize(fontSizeUpperText).text("Commercial", 80, SpaceXUpperText);
  SpaceXUpperText += 11;

  doc
    .fontSize(fontSizeUpperText)
    .text(`${foundLabel.weight} LB ZONE ${zone}`, 80, SpaceXUpperText);

  //right side text
  doc.image("./assets/easypost-premium-assets/easypost.png", 217, 1, {
    height: 25,
  });
  doc.image("./assets/easypost_fixed_barcode.png", 157, 28, { height: 30 });
  doc.fontSize(8).text(`0901000008${threeRandomDigit}`, 238, 64);

  // Draw line above shipping service name
  doc.moveTo(0, 80).lineTo(305, 80).stroke();

  // // Draw Priority Mail/Ground Advantage text
  doc.font(fontRegular).fontSize(16).text("USPS PRIORITY MAIL", 72, 86);

  // Draw line below shipping service name
  doc.moveTo(0, 110).lineTo(305, 110).stroke();

  // // Sender address
  let senderAddressCY = 118;
  doc.fontSize(9).text(foundLabel.from_name.toUpperCase(), 8, senderAddressCY);
  senderAddressCY += 11;
  if (foundLabel.from_company) {
    doc
      .fontSize(9)
      .text(foundLabel.from_company.toUpperCase(), 8, senderAddressCY);
    senderAddressCY += 11;
  }

  let combineAddress = `${foundLabel.from_address1
    .toUpperCase()
    .trim()} ${foundLabel.from_address2.toUpperCase().trim()}`;

  console.log("combineAddress length", combineAddress.length);
  doc.fontSize(9).text(combineAddress, 8, senderAddressCY, { width: 220 });
  senderAddressCY += 11;
  if (combineAddress.length > 40) {
    senderAddressCY += 11;
  }

  let sender_city_state_zip =
    foundLabel.from_city.toUpperCase() +
    " " +
    foundLabel.from_state.toUpperCase() +
    " " +
    foundLabel.from_zip;

  doc.fontSize(9).text(sender_city_state_zip, 8, senderAddressCY);

  // Add shipping data and weight information

  let ran = generateRandomOneToNine();
  doc.font(fontBold).fontSize(13).text(`000${ran}`, 270, 115);

  const boxX = 230;
  const boxY = 140;
  const boxWidth = 35;
  const boxHeight = 18;

  // Draw the box (a rectangle)
  let ran2 = generateRandomElevenToNinetyNine();
  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();
  doc
    .font(fontRegular)
    .fontSize(9)
    .text(`CO${ran2}`, boxX + 6, boxY + 4);

  // Add QR code
  let qrCodePng = await generateQRCode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );
  if (!qrCodePng) {
    return null;
  }
  doc.font(fontRegular).fontSize(9).text("SHIP TO:", 8, 200);
  doc.image(qrCodePng, 14, 218, {
    width: 30,
    height: 30,
  });

  // Add to address
  // // Sender address
  let recAddressCY = 200;
  doc
    .font(fontRegular)
    .fontSize(10)
    .text(foundLabel.to_name.toUpperCase(), 55, recAddressCY);
  recAddressCY += 12;
  if (foundLabel.to_company) {
    doc
      .fontSize(10)
      .text(foundLabel.to_company.toUpperCase(), 55, recAddressCY);
    recAddressCY += 12;
  }

  let combineToAddress = `${foundLabel.to_address1
    .toUpperCase()
    .trim()} ${foundLabel.to_address2.toUpperCase().trim()}`;

  doc.fontSize(10).text(combineToAddress, 55, recAddressCY);
  recAddressCY += 12;

  if (combineToAddress.length > 40) {
    recAddressCY += 12;
  }

  let receiver_city_state_zip =
    foundLabel.to_city.toUpperCase() +
    " " +
    foundLabel.to_state.toUpperCase() +
    " " +
    foundLabel.to_zip;

  doc.fontSize(10).text(receiver_city_state_zip, 55, recAddressCY);

  doc.moveTo(0, 280).lineTo(305, 280).stroke();
  doc.moveTo(0, 281).lineTo(305, 281).stroke();
  doc.moveTo(0, 282).lineTo(305, 282).stroke();

  doc.font(fontBold).fontSize(11).text("USPS TRACKING #", 100, 287);

  // Add barcode image
  let barCodePng = await generateNewBarcode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );

  if (!barCodePng) {
    return null;
  }
  doc.image(barCodePng, 33, 310, { height: 64, width: 240 });

  doc
    .fontSize(12)
    .text(formatTrackingNumber(`${foundLabel.trackingID}`), 72, 385);

  doc.moveTo(0, 405).lineTo(305, 405).stroke();
  doc.moveTo(0, 406).lineTo(305, 406).stroke();
  doc.moveTo(0, 407).lineTo(305, 407).stroke();

  doc.font(fontRegular).fontSize(9).text(foundLabel.note, 10, 415);

  // add qr code again.
  doc.image(qrCodePng, 260, 415, { width: 35, height: 35 });

  doc.end();
  console.log(`generated easypost label check ... ${pdfNamePath}`);
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

module.exports = generateEasypostPremiumPDF;
