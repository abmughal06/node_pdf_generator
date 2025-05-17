const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const { generateNewBarcode } = require("../utils/new-barcode_fun.js");

const generateQRCode = require("../utils/qr-function.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const { formatDateShippo } = require("../utils/format-date.js");
// const { getPartBeforeDash } = require("../utils/get-part-before-dash.js");

async function generateShippoNewPDF(foundLabel, csvFileID) {
  try {
    console.log("generating Shippo NEW label pdf... >>>>>>>>>>>>");

    // Create a new PDF document
    const doc = new PDFDocument({
      size: [320, 470], // Adjust size as necessary
      margin: 0,
    });

    // let pdfNamePath = `./assets/pdfs/shippo-new.pdf`;
    let toName = foundLabel.to_name?.trim().replace(/[ /\\]/g, "-");

    let serialNumber = foundLabel.serialNumber ? foundLabel.serialNumber : 1;
    let pdfNamePath = `./assets/pdfs/shippo-new.pdf`;

    // generate new folder for bulk files
    if (csvFileID) {
      let bulkFilesPath = path.join(__dirname, "../", "bulk_files");
      let newFolderPath = `${bulkFilesPath}/${csvFileID}`;
      if (!fs.existsSync(newFolderPath)) {
        // fs.mkdirSync(newFolderPath);
        fs.mkdir(newFolderPath, { recursive: true }, (err) => {
          if (err) {
            return console.error("Error creating folder:", err);
          }
          console.log("Folder created successfully:", newFolderPath);
        });
      }
      pdfNamePath = `./bulk_files/${csvFileID}/${serialNumber}-${toName}-${foundLabel.trackingID}-shippo-new.pdf`;
    }

    console.log("pdfNamePath", pdfNamePath);

    const fontBold = "./fonts/arial_bold.TTF";
    const fontRegular = "./fonts/Arial.ttf";

    // Output to a file
    doc.pipe(fs.createWriteStream(pdfNamePath));

    const borderX = 10;
    const borderY = 10;
    const borderWidth = 300;
    const borderHeight = 450;
    const border2X = 10.5;
    const border2Y = 10.5;
    const border2Width = 300;
    const border2Height = 450;

    // Draw the box (a rectangle)
    doc.rect(borderX, borderY, borderWidth, borderHeight).stroke();
    doc.rect(border2X, border2Y, border2Width, border2Height).stroke();

    doc.font(fontBold);

    let isGroundAdvantage = foundLabel.shippingService
      .toLowerCase()
      .includes("ground advantage");

    let tag = "P";
    // Draw the "P" and other texts
    if (isGroundAdvantage) {
      tag = "G";
    }
    doc.fontSize(70).text(tag, isGroundAdvantage ? 25 : 28, 15);

    // Draw vertical line
    doc.moveTo(95, 10).lineTo(95, 95).stroke();
    doc.moveTo(95.5, 10).lineTo(95.5, 95).stroke();

    // Define the position and dimensions of the box
    const boxX = isGroundAdvantage ? 174 : 190;
    const boxY = 30;
    const box2X = isGroundAdvantage ? 174.5 : 190.5;
    const box2Y = 30.5;
    const boxWidth = isGroundAdvantage ? 103 : 85;
    const boxHeight = 42;

    // Draw the box (a rectangle)
    doc.rect(boxX, boxY, boxWidth, boxHeight).stroke(); // `stroke()` draws the border, `fillAndStroke()` will fill and then draw the border
    doc.rect(box2X, box2Y, boxWidth, boxHeight).stroke(); // `stroke()` draws the border, `fillAndStroke()` will fill and then draw the border

    // Position the text inside the box
    doc
      .fontSize(7)
      .text(
        isGroundAdvantage ? "USPS GROUND ADVANTAGE" : "PRIORITY MAIL",
        isGroundAdvantage ? boxX + 3 : boxX + 17,
        boxY + 5
      );
    doc
      .fontSize(7)
      .text(
        "U.S. POSTAGE PAID",
        isGroundAdvantage ? boxX + 16 : boxX + 8,
        boxY + 14
      );
    doc
      .fontSize(7)
      .text("Shippo", isGroundAdvantage ? boxX + 40 : boxX + 30, boxY + 21);
    doc
      .fontSize(7)
      .text("ePostage", isGroundAdvantage ? boxX + 36 : boxX + 27, boxY + 29);

    // Draw line above shipping service name
    doc.moveTo(10, 95).lineTo(310, 95).stroke();
    doc.moveTo(10, 95.5).lineTo(310, 95.5).stroke();

    // // Draw Priority Mail/Ground Advantage text
    doc
      .fontSize(19)
      .text(
        isGroundAdvantage ? "USPS GROUND ADVANTAGE" : "USPS PRIORITY MAIL",
        isGroundAdvantage ? 19 : 60,
        97
      );

    if (isGroundAdvantage) {
      doc.fontSize(10).text("TM", 286, 98.5);
    }
    // Draw line below shipping service name
    doc.moveTo(10, 120).lineTo(310, 120).stroke();
    doc.moveTo(10, 120.5).lineTo(310, 120.5).stroke();

    doc.font(fontRegular);

    // // Sender address
    let senderAddressCY = 126;

    doc
      .fontSize(9)
      .text(foundLabel.from_name.toUpperCase(), 18, senderAddressCY);
    senderAddressCY += 11;

    if (foundLabel.from_company) {
      doc
        .fontSize(9)
        .text(foundLabel.from_company.toUpperCase(), 18, senderAddressCY);
      senderAddressCY += 11;
    }

    let combinedFromAddress =
      foundLabel.from_address1.trim() + " " + foundLabel.from_address2.trim();

    doc
      .fontSize(9)
      .text(combinedFromAddress.toUpperCase(), 18, senderAddressCY, {
        width: 150, // endX is the desired end point on the x-axis
        align: "left", // you can also adjust alignment if needed
      });
    senderAddressCY += 11;

    if (combinedFromAddress.length > 25) {
      senderAddressCY = senderAddressCY + 11;
    }
    if (combinedFromAddress.length > 50) {
      senderAddressCY = senderAddressCY + 11;
    }
    if (combinedFromAddress.length > 75) {
      senderAddressCY = senderAddressCY + 11;
    }

    let sender_city_state_zip =
      foundLabel.from_city.toUpperCase() +
      " " +
      foundLabel.from_state.toUpperCase() +
      " " +
      foundLabel.from_zip;

    doc.fontSize(9).text(sender_city_state_zip, 18);
    senderAddressCY += 11;

    // Add shipping data and weight information
    doc
      .fontSize(9)
      .text(`Ship Date: ${formatDateShippo(foundLabel.createdAt)}`, 222, 126);

    if (foundLabel.weight?.toString().length > 1) {
      doc.fontSize(9).text(`Weight : ${foundLabel.weight} lb`, 243, 138);
    } else {
      doc.fontSize(9).text(`Weight : ${foundLabel.weight} lb`, 250, 138);
    }

    let height = Math.ceil(foundLabel.height);
    let width = Math.ceil(foundLabel.width);
    let length = Math.ceil(foundLabel.length);

    if (length > 10 && height > 10 && width > 10) {
      doc
        .fontSize(9)
        .text(`Dimensions: ${length} x ${width} x ${height}`, 200, 150);
    } else if (length < 10 && height < 10 && width < 10) {
      doc
        .fontSize(9)
        .text(`Dimensions: ${length} x ${width} x ${height}`, 215, 150);
    } else if (length > 10 && height > 10) {
      doc
        .fontSize(9)
        .text(`Dimensions: ${length} x ${width} x ${height}`, 205, 150);
    } else if (length > 10 && width > 10) {
      doc
        .fontSize(9)
        .text(`Dimensions: ${length} x ${width} x ${height}`, 205, 150);
    } else if (width > 10 && height > 10) {
      doc
        .fontSize(9)
        .text(`Dimensions: ${length} x ${width} x ${height}`, 205, 150);
    } else {
      doc
        .fontSize(9)
        .text(`Dimensions: ${length} x ${width} x ${height}`, 210, 150);
    }

    // Add QR code
    let qrCodePng = await generateQRCode(
      foundLabel.trackingID,
      foundLabel.to_zip.split("-")[0]
    );
    doc.image(qrCodePng, 18, 220, { width: 35, height: 35 });

    let shiptodetailx = 60;

    // Add to address
    // // Sender address
    let recAddressCY = 218;
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

    let combinedAddress = foundLabel.to_address1 + " " + foundLabel.to_address2;

    doc
      .fontSize(10)
      .text(combinedAddress.toUpperCase(), shiptodetailx, recAddressCY + 12, {
        width: 200, // endX is the desired end point on the x-axis
        align: "left", // you can also adjust alignment if needed
      });
    recAddressCY = recAddressCY + 12;

    if (combinedAddress.length > 33) {
      recAddressCY = recAddressCY + 12;
    }
    if (combinedAddress.length > 60) {
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

    doc.moveTo(10, 295).lineTo(310, 295).stroke();
    doc.moveTo(10, 296).lineTo(310, 296).stroke();
    doc.moveTo(10, 297).lineTo(310, 297).stroke();

    doc.font(fontBold);

    doc.fontSize(10).text("USPS TRACKING # EP", 100, 302);

    // Add barcode image
    let barCodePng = await generateNewBarcode(
      foundLabel.trackingID,
      foundLabel.to_zip.split("-")[0]
    );

    doc.image(barCodePng, 40, 320, { height: 58, width: 240 });

    doc
      .fontSize(10)
      .text(formatTrackingNumber(`${foundLabel.trackingID}`), 85, 383);

    doc.moveTo(10, 400).lineTo(310, 400).stroke();
    doc.moveTo(10, 401).lineTo(310, 401).stroke();
    doc.moveTo(10, 402).lineTo(310, 402).stroke();

    doc.image("./assets/shippo_logo.png", 115, 415, {
      height: 28,
    });

    doc.image(qrCodePng, 260, 410, { width: 35, height: 35 });

    doc.end();
    console.log(`generated shippo new label check ... ${pdfNamePath}`);
    // reutn path of generated pdf file
    return pdfNamePath;
  } catch (error) {
    console.log("Error in generating shippo new pdf..", error);
    return null;
  }
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

module.exports = generateShippoNewPDF;
