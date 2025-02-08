const generatePitneyNewPDF = require("./labelgenerators/pitney_new");
const generateUPS2ndDayAir = require("./labelgenerators/ups_2nd_day_air");
const generateUPSGround = require("./labelgenerators/ups_ground");

function main() {
  // generatePitneyPDF();
  // generateClickNShipPDF();
  // generateRolloPDF();
  // generateEasyPostPDF();
  // generateATFMPDF();
  // generateEVSPDF();
  // generateShippoOldPDF();
  // generateShippoNewPDF();
  // generateUSPSSCANFORM();
  // generatePitneyNewPDF();
  // generateEasypostPremiumPDF();
  generateUPSGround();
}

main();
