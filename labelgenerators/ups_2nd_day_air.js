const PDFDocument = require("pdfkit");
const fs = require("fs");
const { formatUPSDate } = require("../utils/format-date.js");
// const { foundLabelUPS } = require("../utils/data.js");
const {
  generateNewBarcode2UPS,
  generateNewBarcode1UPS,
} = require("../utils/new-barcode_fun.js");
const { generateMaxicode } = require("../utils/maxicode-function.js");
const { generateBarCodeForUPS } = require("../utils/barcode-function.js");

async function generateUPS2ndDayAir(foundLabelUPS) {
  console.log("generating ups 2nd day air new label pdf... >>>>>>>>>>>>>>");
  // Create a new PDF document
  const doc = new PDFDocument({
    size: [300, 480], // Adjust size as necessary
    margin: 0,
  });

  let tracking = foundLabelUPS.trackingID;
  let packageWeight = Math.round(foundLabelUPS.weight);

  let pdfNamePath = `./assets/pdfs/ups-2nd-day-air.pdf`;
  // let pdfNamePath = `./assets/pdfs/${tracking}-2nd-day-air.pdf`;
  let fontRegular = "fonts/RobotoCondensed-Medium.ttf";
  let fontBold = "fonts/RobotoCondensed-Bold.ttf";
  // Output to a file
  doc.pipe(fs.createWriteStream(pdfNamePath));

  //borders
  doc.moveTo(3, 3).lineTo(3, 477).stroke();
  doc.moveTo(3, 3).lineTo(297, 3).stroke();
  doc.moveTo(297, 3).lineTo(297, 477).stroke();
  doc.moveTo(3, 477).lineTo(297, 477).stroke();

  //first horizontal line
  doc.moveTo(3, 180).lineTo(297, 180).stroke();

  //second horizontal line
  doc.moveTo(3, 260).lineTo(297, 260).stroke();
  doc.moveTo(3, 261).lineTo(297, 261).stroke();
  doc.moveTo(3, 262).lineTo(297, 262).stroke();
  doc.moveTo(3, 263).lineTo(297, 263).stroke();
  doc.moveTo(3, 264).lineTo(297, 264).stroke();
  doc.moveTo(3, 265).lineTo(297, 265).stroke();

  //first vertical line
  doc.moveTo(90, 260).lineTo(90, 180).stroke();

  //third horizontal line
  doc.moveTo(3, 304).lineTo(297, 304).stroke();

  //fourth horizontal line
  doc.moveTo(3, 390).lineTo(297, 390).stroke();
  doc.moveTo(3, 391).lineTo(297, 391).stroke();
  doc.moveTo(3, 392).lineTo(297, 392).stroke();
  doc.moveTo(3, 393).lineTo(297, 393).stroke();
  doc.moveTo(3, 394).lineTo(297, 394).stroke();
  doc.moveTo(3, 395).lineTo(297, 395).stroke();

  //from details
  let fromDetailsSpaceX = 6;
  let fromDetailsDiff = 8;
  let fromDetailsFontSize = 8;
  let fromDetailsSpaceY = 8;

  doc
    .font(fontRegular)
    .fontSize(fromDetailsFontSize)
    .text(
      foundLabelUPS.from_name.toUpperCase(),
      fromDetailsSpaceY,
      fromDetailsSpaceX
    );

  fromDetailsSpaceX += fromDetailsDiff;
  if (foundLabelUPS.from_company) {
    doc
      .fontSize(fromDetailsDiff)
      .text(
        foundLabelUPS.from_company.toUpperCase(),
        fromDetailsSpaceY,
        fromDetailsSpaceX
      );
    fromDetailsSpaceX += fromDetailsDiff;
  }
  if (foundLabelUPS.from_phone) {
    doc
      .fontSize(fromDetailsDiff)
      .text(foundLabelUPS.from_phone, fromDetailsSpaceY, fromDetailsSpaceX);
    fromDetailsSpaceX += fromDetailsDiff;
  }
  let completeAddress =
    foundLabelUPS.from_address1 + " " + foundLabelUPS.from_address2;
  let useAddress = completeAddress.trim();
  doc
    .fontSize(fromDetailsFontSize)
    .text(useAddress.toUpperCase(), fromDetailsSpaceY, fromDetailsSpaceX, {
      width: 150,
      lineGap: -0.5,
    });
  fromDetailsSpaceX += fromDetailsDiff;
  if (useAddress.length > 40) {
    fromDetailsSpaceX += fromDetailsDiff;
  }
  if (useAddress.length > 80) {
    fromDetailsSpaceX += fromDetailsDiff;
  }
  doc
    .fontSize(fromDetailsFontSize)
    .text(
      foundLabelUPS.from_city.toUpperCase() +
        " " +
        foundLabelUPS.from_state.toUpperCase() +
        " " +
        foundLabelUPS.from_zip,
      fromDetailsSpaceY,
      fromDetailsSpaceX
    );

  //order details
  doc
    .font(fontBold)
    .fontSize(12)
    .text(packageWeight + " LBS", 160, 6);
  doc.fontSize(12).text("1 OF 1", 220, 6);
  doc
    .font(fontRegular)
    .fontSize(8)
    .text("SHP WT: " + packageWeight + " LBS", 180, 22);
  doc
    .fontSize(8)
    .text(
      "DWT: " +
        foundLabelUPS.length +
        "," +
        foundLabelUPS.width +
        "," +
        foundLabelUPS.height,
      180,
      30
    );
  doc
    .fontSize(8)
    .text("DATE: " + formatUPSDate(foundLabelUPS.createdAt), 180, 38);

  //ship to details
  doc.font(fontBold).fontSize(11).text("SHIP TO:", 8, 90);

  let toDetailsSpaceX = 100;
  let toDetailsDiff = 9;
  let toDetailsFontSize = 9;
  let toDetailsSpaceY = 30;

  doc
    .font(fontRegular)
    .fontSize(toDetailsFontSize)
    .text(
      foundLabelUPS.to_name.toUpperCase(),
      toDetailsSpaceY,
      toDetailsSpaceX
    );

  toDetailsSpaceX += toDetailsDiff;
  if (foundLabelUPS.to_company) {
    doc
      .fontSize(toDetailsFontSize)
      .text(
        foundLabelUPS.to_company.toUpperCase(),
        toDetailsSpaceY,
        toDetailsSpaceX
      );
    toDetailsSpaceX += toDetailsDiff;
  }

  if (foundLabelUPS.to_phone) {
    doc
      .fontSize(toDetailsFontSize)
      .text(foundLabelUPS.to_phone, toDetailsSpaceY, toDetailsSpaceX);
    toDetailsSpaceX += toDetailsDiff;
  }

  let completeToAddress =
    foundLabelUPS.to_address1 + " " + foundLabelUPS.to_address2;
  let useToAddress = completeToAddress.trim();
  doc
    .fontSize(toDetailsFontSize)
    .text(useToAddress.toUpperCase(), toDetailsSpaceY, toDetailsSpaceX);
  toDetailsSpaceX += toDetailsDiff;
  if (useAddress.length > 40) {
    toDetailsSpaceX += toDetailsDiff;
  }
  if (useAddress.length > 80) {
    toDetailsSpaceX += toDetailsDiff;
  }
  doc
    .font(fontBold)
    .fontSize(18)
    .text(
      foundLabelUPS.to_city.toUpperCase() +
        " " +
        foundLabelUPS.to_state.toUpperCase() +
        " " +
        foundLabelUPS.to_zip,
      toDetailsSpaceY,
      toDetailsSpaceX
    );

  let maxicode = await generateMaxicode(foundLabelUPS);

  doc.image(maxicode, 7, 182, { width: 80, height: 75 });

  let cropZipCode = foundLabelUPS.to_zip.substring(0, 3);

  doc
    .font(fontBold)
    .fontSize(24)
    .text(
      `${foundLabelUPS.to_state.toUpperCase()} ${cropZipCode} ${getRandomDigit()}-${getRandomDoubleDigit()}`,
      100,
      180
    );

  let zip1 = foundLabelUPS.to_zip.substring(0, 5);
  let zip2 = foundLabelUPS.to_zip.substring(7, 11) ?? "0000";

  //code 128 type set c barcode
  let barcodePng1 = await generateNewBarcode1UPS(foundLabelUPS.to_zip);

  doc.image(barcodePng1, 105, 210, { width: 102, height: 42 });

  doc.font(fontBold).fontSize(22).text("UPS 2ND DAY AIR", 8, 266);
  doc.font(fontBold).fontSize(28).text("2", 250, 267);
  doc
    .font(fontRegular)
    .fontSize(8)
    .text(
      `TRACKING #: ${formatTrackingNumber(foundLabelUPS.trackingID)}`,
      11,
      290
    );

  let barcodePng2 = await generateNewBarcode2UPS(foundLabelUPS.trackingID);

  doc.image(barcodePng2, 30, 310, { width: 230, height: 70 });

  doc.font(fontRegular).fontSize(10).text("BILLING: P/P", 7, 398);

  doc
    .font(fontRegular)
    .fontSize(6)
    .text("XOL 24.08.02 \t\t NV45 35.0A 08/2024*", 100, 470);

  doc.image("assets/ups-2nd-day-assets/gift-pack-img.png", 223, 440, {
    width: 70,
    height: 30,
  });

  doc.end();
  return pdfNamePath;
}

function formatTrackingNumber(trackingNumber) {
  return trackingNumber.replace(
    /^(.{2})(.{3})(.{3})(.{2})(.{4})(.{4})$/,
    "$1 $2 $3 $4 $5 $6"
  );
}

function getRandomDigit() {
  return Math.floor(Math.random() * 10);
}

// Function to get a random two-digit number (00-99)
function getRandomDoubleDigit() {
  return String(Math.floor(Math.random() * 100)).padStart(2, "0");
}

module.exports = generateUPS2ndDayAir;
