const axios = require("axios");
const sharp = require("sharp");

async function generateBarCode(trackingId, zipCode) {
  try {
    const baseURL = "https://www.bcgen.com/demo/linear-dbgs.aspx";

    // Create the barcode URL with dynamic tracking ID
    const firstTwoDigits = trackingId.substring(0, 2);
    const remainingTrackingId = trackingId.substring(2);
    const barcodeURL = `${baseURL}?S=13&D=~202420${zipCode}\x1D${firstTwoDigits}${remainingTrackingId}&CC=T&CT=T&ST=T&X=0.05&O=0&BBV=0&BBH=0&CG=0&BH=1.4&LM=0.2&EM=0&CS=0&PT=T&TA=F&CA=&CB=`;

    // Request the barcode image
    const response = await axios.get(barcodeURL, {
      responseType: "arraybuffer",
    });

    let imageBuffer = response.data;
    // return imageBuffer;

    const gifBuffer = Buffer.from(imageBuffer);
    await sharp(gifBuffer)
      .metadata()
      .then(async (metadata) => {
        const croppedHeight = metadata.height - 35;
        if (croppedHeight < 0) {
          reject(new Error("Crop height exceeds image height"));
        } else {
          return await sharp(gifBuffer)
            .extract({
              left: 0,
              top: 0,
              width: metadata.width,
              height: croppedHeight,
            })
            .toFile(`./assets/barcodes/${trackingId}-barcode2.png`);
        }
      });
    return `./assets/barcodes/${trackingId}-barcode2.png`;
  } catch (error) {
    console.log("error", error);
    return null;
  }
}

module.exports = generateBarCode;
