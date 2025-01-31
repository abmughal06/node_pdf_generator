const PDFDocument = require("pdfkit");
const fs = require("fs");
const foundLabel = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const { formatDate } = require("../utils/format-date.js");
const { getZone } = require("../utils/zone_function.js");
const { generateNewUPSID } = require("../utils/generate_ups_tracking.js");

async function generatePitneyNewPDF() {
  console.log("generating pitney new label pdf... >>>>>>>>>>>>>>");
  // Create a new PDF document
  const doc = new PDFDocument({
    size: [300, 410], // Adjust size as necessary
    margin: 0,
  });

  // Output to a file
  doc.pipe(
    fs.createWriteStream(
      `./assets/pdfs/${foundLabel.trackingID}-pitney-new.pdf`
    )
  );

  let result = generateNewUPSID();

  // console.log("keys length", result.length);

  console.log(result);

  let isGroundAdvantage = foundLabel.shippingService
    .toLowerCase()
    .includes("ground advantage");

  let tag = "P";
  // Draw the "P" and other texts
  if (isGroundAdvantage) {
    tag = "G";
  }
  doc
    .font("fonts/tt-hoves-pro.ttf")
    .fontSize(80)
    .text(tag, isGroundAdvantage ? 8 : 15, -13);

  // Draw vertical line
  doc.moveTo(80, 0).lineTo(80, 80).stroke();

  spacePostage = 8;

  doc
    .font("fonts/prisma-sans-bold.ttf")
    .fontSize(8)
    .text("US POSTAGE", 88, spacePostage);

  spacePostage += 10;

  doc.fontSize(8).text("PAID", 88, spacePostage);

  doc.fontSize(8).text("IMI", 110, spacePostage);

  spaceDate = 30;

  doc
    .font("fonts/prisma-sans-roman.ttf")
    .fontSize(8)
    .text(formatDate(foundLabel.createdAt), 88, spaceDate);

  spaceDate += 10;

  doc.fontSize(8).text(`From   ${foundLabel.from_zip}`, 88, spaceDate);

  spaceDate += 10;

  let weight = convertDecimalToPoundsAndOunces(foundLabel.weight);

  doc
    .fontSize(8)
    .text(`${weight.pounds} lb ${weight.ounces} ozs`, 88, spaceDate);

  spaceDate += 10;

  let zone = getZone(
    foundLabel.from_state.toString(),
    foundLabel.to_state.toString()
  );
  doc.fontSize(8).text(`${zone}`, 88, spaceDate);

  doc.image("./assets/pitney-fixed.png", 165, 8, { width: 135, height: 30 });

  spacePitney = 42;
  doc
    .font("./fonts/prisma-sans-bold.ttf")
    .fontSize(8)
    .text("Pitney Bowes", 172, spacePitney);
  spacePitney += 10;
  doc
    .font("./fonts/prisma-sans-roman.ttf")
    .fontSize(8)
    .text(isGroundAdvantage ? "09010000838" : "090100008888", 235, spacePitney);
  doc
    .font("./fonts/prisma-sans-bold.ttf")
    .fontSize(8)
    .text("CommPrice", 175, spacePitney);
  spacePitney += 10;
  doc
    .font("./fonts/prisma-sans-roman.ttf")
    .fontSize(8)
    .text("NO SURCHARGE", 166, spacePitney);

  // Draw line above shipping service name
  doc.moveTo(0, 80).lineTo(300, 80).stroke();

  // // Draw Priority Mail/Ground Advantage text
  doc
    .font("./fonts/prisma-sans-bold.ttf")
    .fontSize(isGroundAdvantage ? 15 : 17)
    .text(
      `USPS ${foundLabel.shippingService.toUpperCase()}`,
      isGroundAdvantage ? 25 : 48,
      84
    );
  isGroundAdvantage
    ? doc.fontSize(12).text("TM", 257, 83)
    : doc.image("./assets/r-mark.png", 250, 90, { width: 13, height: 13 });
  // Draw line below shipping service name
  doc.moveTo(0, 110).lineTo(300, 110).stroke();
  // // Sender address
  let senderAddressCY = 115;
  doc
    .font("./fonts/prisma-sans-roman.ttf")
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
    doc
      .fontSize(8)
      .text(
        `${foundLabel.from_address2.toUpperCase()}`,
        8,
        senderAddressCY + 10
      );
    senderAddressCY = senderAddressCY + 10;
  }

  doc
    .fontSize(8)
    .text(
      `${foundLabel.from_city.toUpperCase()} ${foundLabel.from_state.toUpperCase()} ${foundLabel.from_zip.toUpperCase()}`,
      8,
      senderAddressCY + 10
    );
  senderAddressCY = senderAddressCY + 10;

  // Add shipping data and weight information
  let formattedDate = formatDate(foundLabel.createdAt);

  let dateCY = 115;
  doc.fontSize(7).text(`Expected Delivery Date ${formattedDate}`, 165, dateCY);
  dateCY = dateCY + 10;

  let ran = generateRandomOneToNine();
  doc
    .font("./fonts/prisma-sans-bold.ttf")
    .fontSize(12)
    .text(`000${ran}`, 225, dateCY + 20);

  let ran2 = generateRandomElevenToNinetyNine();
  doc.font("./fonts/g-ari-bd.ttf").fontSize(14).text(`C0${ran2}`, 225, 180);

  const boxX = 222;
  const boxY = 178;
  const boxWidth = 40;
  const boxHeight = 20;

  // Draw the box (a rectangle)
  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

  // Add QR code
  let qrCodePng = await generateQRCode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );
  doc.image(qrCodePng, 8, 210, { width: 35, height: 35 });

  // Add to address
  // // Sender address
  let recAddressCY = 210;
  doc
    .font("./fonts/prisma-sans-roman.ttf")
    .fontSize(8)
    .text(foundLabel.to_name.toUpperCase(), 50, recAddressCY);
  if (foundLabel.to_company) {
    doc
      .fontSize(8)
      .text(foundLabel.to_company.toUpperCase(), 50, recAddressCY + 10);
    recAddressCY = recAddressCY + 10;
  }

  let combineAddress = foundLabel.to_address2
    ? foundLabel.to_address1 + " " + foundLabel.to_address2
    : foundLabel.to_address1;

  console.log(combineAddress.length);
  let resultAddress = combineAddress.toUpperCase().trimEnd();
  doc.fontSize(8).text(resultAddress, 50, recAddressCY + 10);

  recAddressCY = recAddressCY + 10;
  if (resultAddress.length > 45) {
    recAddressCY = recAddressCY + 10;
  }
  if (resultAddress.length > 90) {
    recAddressCY = recAddressCY + 10;
  }

  let receiver_city_state_zip =
    foundLabel.to_city.toUpperCase() +
    " " +
    foundLabel.to_state.toUpperCase() +
    " " +
    foundLabel.to_zip;

  doc.fontSize(8).text(receiver_city_state_zip, 50, recAddressCY + 10);

  doc.moveTo(0, 280).lineTo(300, 280).stroke();

  doc
    .font("fonts/prisma-sans-bold.ttf")
    .fontSize(8)
    .text("USPS TRACKING # EP", 100, 285);

  // Add barcode image
  let barCodePng = await generateBarCode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );

  doc.image(barCodePng, 35, 295, { width: 230, height: 55 });

  doc.fontSize(8).text(formatTrackingNumber(`${result}`), 82, 350);

  doc.moveTo(0, 365).lineTo(300, 365).stroke();

  doc
    .font("./fonts/prisma-sans-roman.ttf")
    .fontSize(7)
    .text(foundLabel.note, 10, 370);

  // add qr code again.
  doc.image(qrCodePng, 250, 370, { width: 35, height: 35 });

  doc.end();
  console.log("generated pitney label check ... outputs/pitney.pdf");
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

// 2. Function to generate a random number between 11 and 99
function generateRandomElevenToNinetyNine() {
  return Math.floor(Math.random() * (99 - 11 + 1)) + 11;
}

// 3. Function to convert a string into the desired format
function formatString(str) {
  return str
    .replace(/(\d{1})(\d{3})?/g, (match, p1, p2) => {
      return p1 + " " + (p2 ? p2.split("").join(" ") + "  " : "");
    })
    .trim();
}

function convertDecimalToPoundsAndOunces(decimalValue) {
  if (typeof decimalValue !== "number" || decimalValue < 0) {
    throw new Error("Input must be a positive number.");
  }

  // Separate the whole and fractional parts
  const pounds = Math.floor(decimalValue); // Whole pounds
  const fractionalPart = decimalValue - pounds;

  // Convert the fractional part into ounces (1 pound = 16 ounces)
  const ounces = Math.round(fractionalPart * 16);

  return { pounds, ounces };
}

module.exports = generatePitneyNewPDF;
