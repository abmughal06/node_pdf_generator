const PDFDocument = require("pdfkit");
const fs = require("fs");
const foundLabel = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const formatDate = require("../utils/format-date.js");

async function generateClickNShipPDF() {
  console.log("generating ClickNShip label pdf... >>>>>>>>>>>>>>");
  // Create a new PDF document
  const doc = new PDFDocument({
    size: [350, 550], // Adjust size as necessary
    margin: 0,
  });

  // Output to a file
  doc.pipe(
    fs.createWriteStream(
      `./assets/pdfs/${foundLabel.trackingID}-clicknship.pdf`
    )
  );
  doc.moveTo(2, 2).lineTo(2, 548).stroke();
  doc.moveTo(2, 2).lineTo(348, 2).stroke();
  doc.moveTo(348, 2).lineTo(348, 548).stroke();
  doc.moveTo(2, 548).lineTo(348, 548).stroke();

  doc.image("./assets/usps.png", 5, 6, { height: 25 });
  doc.image("./assets/click-n-ship.png", 210, 6, { height: 25 });
  doc.moveTo(2, 36).lineTo(348, 36).stroke();
  doc.font("fonts/helvatica-bold.ttf").fontSize(85).text("P", 12, 43);
  doc.moveTo(80, 36).lineTo(80, 125).stroke();
  doc.moveTo(2, 125).lineTo(348, 125).stroke();
  let spacey = 40;
  doc
    .font("fonts/helvatica-italic.ttf")
    .fontSize(10)
    .text("usps.com", 84, spacey);
  spacey += 12;
  let ran1 = generateRandomFourDigitNumber();
  let ran2 = generateRandomFourDigitNumber();
  let ran3 = generateRandomFourDigitNumber();
  let ran4 = generateRandomFourDigitNumber();

  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(8)
    .text(
      `${formatTrackingNumber(
        foundLabel.trackingID
      )} ${ran1} ${ran2} ${ran3} ${ran4}`,
      150,
      spacey - 5
    );
  doc
    .font("fonts/helvatica-bold.ttf")
    .fontSize(10)
    .text("\x2419.20", 84, spacey);
  spacey += 13;
  doc
    .font("fonts/helvatica-bold.ttf")
    .fontSize(10)
    .text("US POSTAGE", 84, spacey);
  doc.image("./assets/paid-logo.png", 213, spacey + 5, { height: 30 });
  spacey += 50;
  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(10)
    .text(
      `${formatDate(foundLabel.createdAt)}   ${
        foundLabel.weight
      } lb 0 ozs   Mailed from ${foundLabel.from_zip}`,
      84,
      spacey
    );
  spacey += 18;
  doc
    .font("fonts/helvatica-bold.ttf")
    .fontSize(20)
    .text("PRIORITY MAIL", 100, spacey);

  doc.image("./assets/r-mark.png", 250, spacey, { height: 15 });
  doc.moveTo(2, 155).lineTo(348, 155).stroke();

  spacey += 30;
  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(8)
    .text(
      `Expected Delivery Date ${formatDate(foundLabel.createdAt)}`,
      218,
      spacey
    );

  let ranOneDigit = generateRandomOneToNine();
  doc
    .font("fonts/helvatica-bold.ttf")
    .fontSize(15)
    .text(`000${ranOneDigit}`, 310, spacey + 20);

  let randomLetterAndNumber = generateRandomLetterAndNumber();

  doc
    .font("./fonts/g-ari-bd.ttf")
    .fontSize(14)
    .text(`${randomLetterAndNumber}`, 250, 210);

  const boxX = 247;
  const boxY = 208;
  const boxWidth = 40;
  const boxHeight = 20;

  // Draw the box (a rectangle)
  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

  let spaceyFromDetail = spacey;
  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(10)
    .text(foundLabel.from_name.toUpperCase(), 8, spaceyFromDetail);
  spaceyFromDetail += 12;

  if (foundLabel.from_company) {
    doc
      .font("fonts/helvatica_2.ttf")
      .fontSize(10)
      .text(foundLabel.from_company.toUpperCase(), 8, spaceyFromDetail);
    spaceyFromDetail += 12;
  }

  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(10)
    .text(foundLabel.from_address1.toUpperCase(), 8, spaceyFromDetail);
  spaceyFromDetail += 12;

  if (foundLabel.from_address2) {
    doc
      .font("fonts/helvatica_2.ttf")
      .fontSize(10)
      .text(foundLabel.from_address2.toUpperCase(), 8, spaceyFromDetail);
    spaceyFromDetail += 12;
  }

  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(10)
    .text(
      `${foundLabel.from_city.toUpperCase()} ${foundLabel.from_state.toUpperCase()} ${
        foundLabel.from_zip
      }`,
      8,
      spaceyFromDetail
    );

  let spaceqr = 300;
  let qrcode = await generateQRCode(foundLabel.trackingID, foundLabel.to_zip);
  doc.image(qrcode, 8, spaceqr, { height: 35, width: 35 });

  let spaceyToDetail = spaceqr - 5;
  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(10)
    .text(foundLabel.to_name.toUpperCase(), 50, spaceyToDetail);
  spaceyToDetail += 12;

  if (foundLabel.to_company) {
    doc
      .font("fonts/helvatica_2.ttf")
      .fontSize(10)
      .text(foundLabel.to_company.toUpperCase(), 50, spaceyToDetail);
    spaceyToDetail += 12;
  }

  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(10)
    .text(foundLabel.from_address1.toUpperCase(), 50, spaceyToDetail);
  spaceyToDetail += 12;

  if (foundLabel.to_address2) {
    doc
      .font("fonts/helvatica_2.ttf")
      .fontSize(10)
      .text(foundLabel.to_address2.toUpperCase(), 50, spaceyToDetail);
    spaceyToDetail += 12;
  }

  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(10)
    .text(
      `${foundLabel.to_city.toUpperCase()} ${foundLabel.to_state.toUpperCase()} ${
        foundLabel.to_zip
      }`,
      50,
      spaceyToDetail
    );

  doc.moveTo(2, 362).lineTo(348, 362).stroke();

  let afterDetails = 362;
  doc
    .font("fonts/helvatica-bold.ttf")
    .fontSize(14)
    .text("USPS TRACKING #", 120, afterDetails + 10);
  afterDetails += 25;
  let barcode = await generateBarCode(foundLabel.trackingID, foundLabel.to_zip);
  doc.image(barcode, 15, afterDetails, { height: 70, width: 320 });
  afterDetails += 80;
  doc
    .fontSize(12)
    .text(formatTrackingNumber(foundLabel.trackingID), 100, afterDetails);
  afterDetails += 15;
  doc.moveTo(2, afterDetails).lineTo(348, afterDetails).stroke();
  afterDetails += 15;
  doc.image(qrcode, 300, afterDetails, { height: 35, width: 35 });

  doc
    .font("fonts/helvatica_2.ttf")
    .fontSize(14)
    .text("Electronic Rate Approved #038555749", 15, afterDetails + 15, {
      width: 300,
    });

  doc.end();
  console.log("generated ClickNShip label check ... outputs/pitney.pdf");
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

function generateRandomFourDigitNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

function generateRandomLetterAndNumber() {
  const letters = ["B", "R", "C"];
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");

  return `${randomLetter}0${randomNumber}`;
}

module.exports = generateClickNShipPDF;
