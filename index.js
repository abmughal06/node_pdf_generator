const generatePitneyNewPDF = require("./labelgenerators/pitney_new");
const generateUPS2ndDayAir = require("./labelgenerators/ups_2nd_day_air");

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
  generateUPS2ndDayAir();
}

main();
