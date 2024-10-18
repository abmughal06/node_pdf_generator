const generateATFMPDF = require("./labels_view/atfm");
const generateClickNShipPDF = require("./labels_view/clicknship");
const generateEasyPostPDF = require("./labels_view/easypost");
const generateEVSPDF = require("./labels_view/evs");
const generatePitneyPDF = require("./labels_view/pitney");
const generateRolloPDF = require("./labels_view/rollo");

function main() {
  // generatePitneyPDF();
  // generateClickNShipPDF();
  // generateRolloPDF();
  // generateEasyPostPDF();
  // generateATFMPDF();
  generateEVSPDF();
}

main();
