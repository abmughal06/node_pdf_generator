const PDFDocument = require("pdfkit");
const fs = require("fs");
const { foundLabel } = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
// const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const { formatDateEasyPostPremium } = require("../utils/format-date.js");
const { generateNewBarcode } = require("../utils/new-barcode_fun.js");
const { getZone2 } = require("../utils/zone_function.js");

async function generateEasypostPremiumPDF() {
  console.log("generating Easypost Premium NEW label pdf... >>>>>>>>>>>>");

  // Create a new PDF document
  const doc = new PDFDocument({
    size: [335, 490], // Adjust size as necessary
    margin: 0,
  });

  let pdfNamePath = `./assets/pdfs/easypost-premium.pdf`;
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
  let isGroundAdvantage = foundLabel.shippingService
    .toLowerCase()
    .includes("ground advantage");

  if (isGroundAdvantage) {
    doc.font(fontBold).fontSize(80).text("G", 18, 5);
  } else {
    doc.font(fontBold).fontSize(80).text("P", 22, 6);
  }

  // Draw vertical line
  doc.moveTo(90, 10).lineTo(90, 90).stroke();

  let threeRandomDigit = generateThreeRandomNumbers();

  let zone = getZone2(
    foundLabel.from_state.toString(),
    foundLabel.to_state.toString()
  );

  let fontSizeUpperText = 8;
  let SpaceYUpperText = 18;
  let SpaceXUpperText = 105;

  doc
    .fontSize(fontSizeUpperText + 1)
    .text("US POSTAGE AND FEES PAID", SpaceXUpperText, SpaceYUpperText);
  SpaceYUpperText += 12;
  doc
    .font(fontRegular)
    .fontSize(fontSizeUpperText)
    .text(
      formatDateEasyPostPremium(foundLabel.createdAt),
      SpaceXUpperText,
      SpaceYUpperText
    );
  SpaceYUpperText += 11;

  doc
    .fontSize(fontSizeUpperText)
    .text(foundLabel.from_zip.split("-")[0], SpaceXUpperText, SpaceYUpperText);
  SpaceYUpperText += 11;

  doc
    .fontSize(fontSizeUpperText)
    .text("C6592937", SpaceXUpperText, SpaceYUpperText);
  SpaceYUpperText += 11;

  doc
    .fontSize(fontSizeUpperText)
    .text("Commercial", SpaceXUpperText, SpaceYUpperText);
  SpaceYUpperText += 11;

  doc
    .fontSize(fontSizeUpperText)
    .text(
      `${foundLabel.weight} LB ZONE ${zone}`,
      SpaceXUpperText,
      SpaceYUpperText
    );

  //right side text
  doc.image("./assets/easypost-premium-assets/easypost.png", 235, 11, {
    height: 25,
  });
  doc.image("./assets/easypost_fixed_barcode.png", 175, 38, { height: 30 });
  doc.fontSize(8).text(`0901000008${threeRandomDigit}`, 257, 74);

  // Draw line above shipping service name
  doc.moveTo(10, 90).lineTo(325, 90).stroke();

  // Draw Priority Mail/Ground Advantage text
  if (isGroundAdvantage) {
    doc.font(fontRegular).fontSize(15).text("USPS GROUND ADVANTAGE", 60, 94);
    doc.font(fontRegular).fontSize(8).text("TM", 268, 95);
  } else {
    doc.font(fontRegular).fontSize(15).text("USPS PRIORITY MAIL", 85, 94);
  }

  // Draw line below shipping service name
  doc.moveTo(10, 115).lineTo(325, 115).stroke();

  // // Sender address
  let senderAddressCY = 122;
  let senderAddressCX = 18;

  doc
    .fontSize(9)
    .text(foundLabel.from_name.toUpperCase(), senderAddressCX, senderAddressCY);
  senderAddressCY += 11;
  if (foundLabel.from_company) {
    doc
      .fontSize(9)
      .text(
        foundLabel.from_company.toUpperCase(),
        senderAddressCX,
        senderAddressCY
      );
    senderAddressCY += 11;
  }

  let combineAddress = `${foundLabel.from_address1
    .toUpperCase()
    .trim()} ${foundLabel.from_address2.toUpperCase().trim()}`;

  console.log("combineAddress length", combineAddress.length);
  doc
    .fontSize(9)
    .text(combineAddress, senderAddressCX, senderAddressCY, { width: 180 });
  senderAddressCY += 11;
  if (combineAddress.length > 30) {
    senderAddressCY += 11;
  }

  let sender_city_state_zip =
    foundLabel.from_city.toUpperCase() +
    " " +
    foundLabel.from_state.toUpperCase() +
    " " +
    foundLabel.from_zip;

  doc.fontSize(9).text(sender_city_state_zip, senderAddressCX, senderAddressCY);

  // Add shipping data and weight information

  let ran = generateRandomOneToNine();
  doc.font(fontBold).fontSize(14).text(`000${ran}`, 285, 125);

  const boxX = 240;
  const boxY = 160;
  const boxWidth = 37;
  const boxHeight = 18;

  // Draw the box (a rectangle)
  let ran2 = generateRandomElevenToNinetyNine();
  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();
  doc
    .font(fontRegular)
    .fontSize(10)
    .text(`CO${ran2}`, boxX + 6, boxY + 4);

  // Add QR code
  let qrCodePng = await generateQRCode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );
  if (!qrCodePng) {
    return null;
  }
  doc.font(fontRegular).fontSize(9).text("SHIP TO:", 18, 220);
  doc.image(qrCodePng, 24, 238, {
    width: 30,
    height: 30,
  });

  // Add to address
  // // Sender address
  let recAddressCY = 220;
  let recAddressCX = 65;
  doc
    .font(fontRegular)
    .fontSize(10)
    .text(foundLabel.to_name.toUpperCase(), recAddressCX, recAddressCY);
  recAddressCY += 12;
  if (foundLabel.to_company) {
    doc
      .fontSize(10)
      .text(foundLabel.to_company.toUpperCase(), recAddressCX, recAddressCY);
    recAddressCY += 12;
  }

  let combineToAddress = `${foundLabel.to_address1
    .toUpperCase()
    .trim()} ${foundLabel.to_address2.toUpperCase().trim()}`;

  doc.fontSize(10).text(combineToAddress, recAddressCX, recAddressCY);
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

  doc.fontSize(10).text(receiver_city_state_zip, recAddressCX, recAddressCY);

  doc.moveTo(10, 300).lineTo(325, 300).stroke();
  doc.moveTo(10, 301).lineTo(325, 301).stroke();
  doc.moveTo(10, 302).lineTo(325, 302).stroke();

  doc.font(fontBold).fontSize(13).text("USPS TRACKING #", 105, 305);

  // Add barcode image
  let barCodePng = await generateNewBarcode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );

  if (!barCodePng) {
    return null;
  }
  doc.image(barCodePng, 47.5, 330, { height: 64, width: 240 });

  doc
    .fontSize(14)
    .text(formatTrackingNumber(`${foundLabel.trackingID}`), 70, 404);

  doc.moveTo(10, 423).lineTo(325, 423).stroke();
  doc.moveTo(10, 424).lineTo(325, 424).stroke();
  doc.moveTo(10, 425).lineTo(325, 425).stroke();

  doc.font(fontRegular).fontSize(9).text(foundLabel.note, 20, 435);

  // add qr code again.
  doc.image(qrCodePng, 278, 435, { width: 35, height: 35 });

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
