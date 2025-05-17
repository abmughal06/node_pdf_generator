const PDFDocument = require("pdfkit");
const fs = require("fs");
const { foundLabel } = require("../utils/data.js");
const generateQRCode = require("../utils/qr-function.js");
const { generateBarCode } = require("../utils/barcode-function.js");
const { generateNewBarcode } = require("../utils/new-barcode_fun.js");
const formatTrackingNumber = require("../utils/format-tracking-fun.js");
const { formatDate } = require("../utils/format-date.js");

async function generateRolloExpressPDF() {
  try {
    console.log("generating rollo express label pdf... >>>>>>>>>>>>");

    // Create a new PDF document
    const doc = new PDFDocument({
      size: [288, 445], // Adjust size as necessary
      // size: [300, 445], // Adjust size as necessary
      margin: 0,
    });

    doc.moveTo(2, 2).lineTo(2, 443).stroke();
    doc.moveTo(2, 2).lineTo(286, 2).stroke();
    doc.moveTo(286, 2).lineTo(286, 443).stroke();
    doc.moveTo(2, 443).lineTo(286, 443).stroke();

    // let toName = foundLabel.to_name?.trim().replace(/ /g, "-");
    let toName = foundLabel.to_name?.trim().replace(/[ /\\]/g, "-");

    let serialNumber = foundLabel.serialNumber ? foundLabel.serialNumber : 1;
    let pdfNamePath = `./assets/pdfs/rollo-express.pdf`;

    // generate new folder for bulk files
    // if (csvFileID) {
    //   let bulkFilesPath = path.join(__dirname, "../", "bulk_files");
    //   let newFolderPath = `${bulkFilesPath}/${csvFileID}`;
    //   if (!fs.existsSync(newFolderPath)) {
    //     // fs.mkdirSync(newFolderPath);
    //     fs.mkdir(newFolderPath, { recursive: true }, (err) => {
    //       if (err) {
    //         return console.error("Error creating folder:", err);
    //       }
    //       console.log("Folder created successfully:", newFolderPath);
    //     });
    //   }
    //   pdfNamePath = `./bulk_files/${csvFileID}/${serialNumber}-${toName}-${foundLabel.trackingID}-rollo.pdf`;
    // }

    console.log("pdfNamePath", pdfNamePath);
    // Output to a file
    doc.pipe(fs.createWriteStream(pdfNamePath));

    doc.font("fonts/Helvetica.ttf");

    // let isGroundAdvantage = foundLabel.shippingService
    //   .toLowerCase()
    //   .includes("ground advantage");

    doc.fontSize(60).text("E", 30, 20);

    // Draw vertical line
    doc.moveTo(90, 2).lineTo(90, 80).stroke();

    // Define the position and dimensions of the box
    const boxX = 160;
    const boxY = 20;
    const boxWidth = 100;
    const boxHeight = 40;

    // Draw the box (a rectangle)
    doc.rect(boxX, boxY, boxWidth, boxHeight).stroke(); // `stroke()` draws the border, `fillAndStroke()` will fill and then draw the border

    // Position the text inside the box
    doc.fontSize(10).text("U.S. POSTAGE PAID", boxX + 5, boxY + 5);
    doc.fontSize(10).text("ROLLO", boxX + 5, boxY + 15);
    doc.fontSize(10).text("ePostage", boxX + 5, boxY + 25);

    // Draw line above shipping service name
    doc.moveTo(2, 80).lineTo(286, 80).stroke();

    // // Draw Priority Mail/Ground Advantage text
    doc.fontSize(20).text("Priority Mail Express".toUpperCase(), 50, 88);
    // Draw line below shipping service name
    doc.moveTo(2, 110).lineTo(286, 110).stroke();

    // // Sender address
    let senderAddressCY = 115;
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
      foundLabel.from_city.toString().toUpperCase().trim() +
      " " +
      foundLabel.from_state.toString().toUpperCase().trim() +
      " " +
      foundLabel.from_zip.toString().trim();

    doc.fontSize(10).text(sender_city_state_zip, 8, senderAddressCY + 12);

    // Add shipping data and weight information
    let formattedDate = formatDate(foundLabel.createdAt);
    // let type = isGroundAdvantage ? "ground" : "priority";
    // let formattedDate = await getDeliveryDate(type);

    let dateCY = 115;
    doc.fontSize(10).text(`Ship Date: ${formattedDate}`, 193, dateCY);
    dateCY = dateCY + 12;

    let weightX = 215;
    // if (foundLabel.weight?.toString().length > 1) {
    //   weightX = 210;
    // }
    // doc
    //   .fontSize(10)
    //   .text(`Weight: ${foundLabel.weight} lb 0 oz`, weightX, dateCY);
    // dateCY = dateCY + 14;

    let { pounds, ounces } = await lbsToLbsOz(foundLabel.weight);

    if (pounds?.toString().length > 1) {
      weightX = 210;
    }
    if (ounces?.toString().length > 1) {
      weightX = 210;
    }
    doc.fontSize(10).text(`Weight: ${pounds} lb ${ounces} oz`, weightX, dateCY);
    dateCY = dateCY + 14;

    let ran = generateRandomOneToNine();
    doc.fontSize(14).text(`000${ran}`, 254, dateCY);

    // Add QR code
    let qrCodePng = await generateQRCode(
      foundLabel.trackingID,
      foundLabel.to_zip.split("-")[0]
      // foundLabel.to_zip
    );
    if (!qrCodePng) {
      return null;
    }
    doc.image(qrCodePng, 8, 220, { width: 35, height: 35 });

    // Add to address
    // // Sender address
    let recAddressCY = 219;

    if (!foundLabel.to_company) {
      recAddressCY = recAddressCY + 2;
    }

    console.log("recAddressCY", recAddressCY);
    if (!foundLabel.to_address2) {
      recAddressCY = recAddressCY + 2;
    }
    console.log("recAddressCY", recAddressCY);

    doc.fontSize(10).text(foundLabel.to_name.toUpperCase(), 50, recAddressCY);
    // recAddressCY = recAddressCY + 15;
    if (foundLabel.to_company) {
      doc
        .fontSize(10)
        .text(foundLabel.to_company.toUpperCase(), 50, recAddressCY + 12);
      recAddressCY = recAddressCY + 12;
    }

    let combinedAddress = foundLabel.to_address1.trim() + " " + foundLabel.to_address2.trim();

    doc
      .fontSize(10)
      .text(combinedAddress.toUpperCase(), 50, recAddressCY + 12, {
        width: 250, // endX is the desired end point on the x-axis
        align: "left", // you can also adjust alignment if needed
      });
    recAddressCY = recAddressCY + 12;

    if (combinedAddress.length > 40) {
      recAddressCY = recAddressCY + 12;
    }

    let receiver_city_state_zip =
      foundLabel.to_city.toString().toUpperCase().trim() +
      " " +
      foundLabel.to_state.toString().toUpperCase().trim() +
      " " +
      foundLabel.to_zip.toString().trim();

    doc.fontSize(10).text(receiver_city_state_zip, 50, recAddressCY + 12);

    doc.moveTo(2, 283).lineTo(286, 283).stroke();
    doc.moveTo(2, 284).lineTo(286, 284).stroke();
    doc.moveTo(2, 285).lineTo(286, 285).stroke();

    doc.fontSize(12).text("USPS TRACKING # EP", 92, 295);

    // Add barcode image
    let barCodePng = await generateNewBarcode(
      foundLabel.trackingID,
      foundLabel.to_zip.split("-")[0]
    );

    if (!barCodePng) {
      return null;
    }
    console.log("barCodePng", barCodePng);
    await doc.image(barCodePng, 35, 315, { height: 50, width: 220 });

    doc
      .fontSize(12)
      .text(formatTrackingNumber(`${foundLabel.trackingID}`), 72, 375);

    doc.moveTo(2, 390).lineTo(286, 390).stroke();
    doc.moveTo(2, 391).lineTo(286, 391).stroke();
    doc.moveTo(2, 392).lineTo(286, 392).stroke();

    doc.fontSize(9).text(foundLabel.note, 10, 400, { width: 230 });

    await doc.image(qrCodePng, 240, 400, { width: 35, height: 35 });

    await doc.end();
    console.log(`generated rollo label check ... ${pdfNamePath}`);
    // reutn path of generated pdf file

    // removebarcodeImage(barCodePng);
    return pdfNamePath;
  } catch (error) {
    console.log("Error in generating rollow pdf..", error);
    return null;
  }
}

function generateRandomOneToNine() {
  return Math.floor(Math.random() * 9) + 1;
}

function lbsToLbsOz(weightInLbs) {
  // Extract the whole pounds
  const pounds = Math.floor(weightInLbs);

  // Calculate the remaining ounces (16 ounces in 1 pound)
  const ounces = Math.round((weightInLbs - pounds) * 16);

  return { pounds, ounces };
  // return `${pounds} lbs ${ounces} oz`;
}

module.exports = generateRolloExpressPDF;

// [)>01966851600008400021Z36478646UPSNV80W460211/11N5421 LA SALLELINCOLNNE
