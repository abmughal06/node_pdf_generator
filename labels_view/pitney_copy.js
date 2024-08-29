const PDFDocument = require("pdfkit");
const fs = require("fs");
const foundLabel = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const generateBarCode = require("../utils/barcode-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const formatDate = require("../utils/format-date.js");

async function generatePitneyCopyPDF() {
  console.log("generating pitney label pdf... >>>>>>>>>>>>>>");
  // Create a new PDF document
  const doc = new PDFDocument({
    size: [300, 445], // Adjust size as necessary
    margin: 0,
  });

  // Output to a file
  doc.pipe(
    fs.createWriteStream(`./assets/pdfs/${foundLabel.trackingID}-pitney.pdf`)
  );

  let isGroundAdvantage = foundLabel.shippingService
    .toLowerCase()
    .includes("ground advantage");

  let tag = "P";
  // Draw the "P" and other texts
  if (isGroundAdvantage) {
    tag = "G";
  }
  doc.font("fonts/crepes-outline1.otf").fontSize(80).text(tag, 8, -13);
  doc.font("fonts/arial-nova.ttf");

  // Draw vertical line
  doc.moveTo(85, 0).lineTo(85, 80).stroke();

  doc.fontSize(11).text("US POSTAGE", 95, 8);

  doc.fontSize(11).text("PAID", 95, 21);

  doc.fontSize(8).text("IMI", 118, 25);

  doc.fontSize(8).text(formatDate(foundLabel.createdAt), 95, 35);

  doc.fontSize(8).text(`From   ${foundLabel.from_zip}`, 95, 44);

  doc.fontSize(8).text(`${foundLabel.weight}lbs 1ozs`, 95, 52);

  doc.fontSize(8).text(`Zone 1`, 95, 60);

  doc.image("./assets/pitney-fixed.png", 165, 8, { width: 135, height: 30 });

  doc.font("./fonts/g-ari-bd.ttf").fontSize(10).text("Pitney Bowes", 162, 42);
  doc
    .font("./fonts/arial-nova.ttf")
    .fontSize(9)
    .text("028W0002310476", 231, 42);
  doc.font("./fonts/g-ari-bd.ttf").fontSize(10).text("CommPrice", 165, 53);
  doc.font("./fonts/arial-nova.ttf").fontSize(10).text("NO SURCHARGE", 162, 63);
  doc.fontSize(9).text("3003586281", 252, 63);

  // Draw line above shipping service name
  doc.moveTo(0, 80).lineTo(300, 80).stroke();

  // // Draw Priority Mail/Ground Advantage text
  doc
    .font("./fonts/g-ari-bd.ttf")
    .fontSize(20)
    .text(
      `USPS ${foundLabel.shippingService.toUpperCase()}`,
      isGroundAdvantage ? 35 : 50,
      84
    );
  doc.font("./fonts/arial-nova.ttf");
  doc.image("./assets/pitney-r.png", 255, 83, { width: 13, height: 13 });
  // Draw line below shipping service name
  doc.moveTo(0, 110).lineTo(300, 110).stroke();

  // // Sender address
  let senderAddressCY = 115;
  doc.fontSize(10).text(foundLabel.from_name.toUpperCase(), 8, senderAddressCY);
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
    doc
      .fontSize(10)
      .text(
        `${foundLabel.from_address2.toUpperCase()}`,
        8,
        senderAddressCY + 12
      );
    senderAddressCY = senderAddressCY + 12;
  }

  doc
    .fontSize(10)
    .text(
      `${foundLabel.from_city.toUpperCase()} ${foundLabel.from_state.toUpperCase()} ${foundLabel.from_zip.toUpperCase()}`,
      8,
      senderAddressCY + 12
    );
  senderAddressCY = senderAddressCY + 12;

  // Add shipping data and weight information
  let formattedDate = formatDate(foundLabel.createdAt);

  let dateCY = 115;
  doc.fontSize(9).text(`Expected Delivery Date ${formattedDate}`, 165, dateCY);
  dateCY = dateCY + 12;

  let ran = generateRandomOneToNine();
  doc.font("./fonts/g-ari-bd.ttf").fontSize(14).text(`000${ran}`, 220, 170);

  let ran2 = generateRandomElevenToNinetyNine();
  doc.font("./fonts/g-ari-bd.ttf").fontSize(14).text(`C0${ran2}`, 218, 210);

  const boxX = 215;
  const boxY = 208;
  const boxWidth = 40;
  const boxHeight = 20;

  // Draw the box (a rectangle)
  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

  doc.font("./fonts/arial-nova.ttf");

  // Add QR code
  let qrCodePng = await generateQRCode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );
  doc.image(qrCodePng, 8, 220, { width: 40, height: 40 });

  // Add to address
  // // Sender address
  let recAddressCY = 219;
  doc.fontSize(12).text(foundLabel.to_name.toUpperCase(), 55, recAddressCY);
  // if (foundLabel.to_company) {
  //   doc
  //     .fontSize(10)
  //     .text(foundLabel.to_company.toUpperCase(), 55, recAddressCY + 12);
  //   recAddressCY = recAddressCY + 12;
  // }

  doc
    .fontSize(12)
    .text(foundLabel.to_address1.toUpperCase(), 55, recAddressCY + 15);
  recAddressCY = recAddressCY + 15;

  // if (foundLabel.to_address2) {
  //   doc
  //     .fontSize(10)
  //     .text(foundLabel.to_address2.toUpperCase(), 55, recAddressCY + 12);
  //   recAddressCY = recAddressCY + 12;
  // }

  let receiver_city_state_zip =
    foundLabel.to_city.toUpperCase() +
    " " +
    foundLabel.to_state.toUpperCase() +
    " " +
    foundLabel.to_zip;

  doc.fontSize(12).text(receiver_city_state_zip, 55, recAddressCY + 15);

  doc.moveTo(0, 280).lineTo(300, 280).stroke();

  doc.fontSize(12).text("USPS TRACKING # EP", 92, 285);

  // Add barcode image
  let barCodePng = await generateBarCode(
    foundLabel.trackingID,
    foundLabel.to_zip
  );

  doc.image(barCodePng, 35, 300, { width: 230, height: 55 });

  doc
    .font("./fonts/g-ari-bd.ttf")
    .fontSize(10)
    .text(formatString(`${foundLabel.trackingID}`), 54, 360);

  doc.font("./fonts/arial-nova.ttf");

  doc.moveTo(0, 380).lineTo(300, 380).stroke();

  doc.fontSize(10).text(foundLabel.note, 10, 390);

  // add qr code again.
  doc.image(qrCodePng, 250, 390, { width: 40, height: 40 });

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

module.exports = generatePitneyCopyPDF;
