const generateEasypostNewPDF = require("./labelgenerators/easypost-new");
const generateEasypostPremiumPDF = require("./labelgenerators/easypost_premium");
const generatePitneyNewPDF = require("./labelgenerators/pitney_new");
const generateUPS2ndDayAir = require("./labelgenerators/ups_2nd_day_air");
const generateUPSGround = require("./labelgenerators/ups_ground");
const generateUPSNextDayAir = require("./labelgenerators/ups_next_day_air");
const generateUSPSPriorityMailPDF = require("./labelgenerators/usps_priority_mail");
const { foundLabelList, foundLabelUPS } = require("./utils/data");

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
  // generateBulk2ndDayAir();
  // generateUPS2ndDayAir(foundLabelUPS);
  // generateUPSNextDayAir(foundLabelUPS);
  // generateUSPSPriorityMailPDF();
  // generateEasypostPremiumPDF();
  generateEasypostNewPDF();
}

async function generateBulkUPSGround(){
  for (let i = 0; i < foundLabelList.length; i++) {
    let oneLabel = foundLabelList[i];
    await generateUPSGround(oneLabel);
    console.log(`Generated UPS ground label ${i + 1} of ${foundLabelList.length}`);
  }
}
async function generateBulk2ndDayAir(){
  for (let i = 0; i < foundLabelList.length; i++) {
    let oneLabel = foundLabelList[i];
    await generateUPS2ndDayAir(oneLabel);
    console.log(`Generated UPS 2nd day air label ${i + 1} of ${foundLabelList.length}`);
  }
}
async function generateBulk2ndDayAir(){
  for (let i = 0; i < foundLabelList.length; i++) {
    let oneLabel = foundLabelList[i];
    await generateUPS2ndDayAir(oneLabel);
    console.log(`Generated UPS 2nd day air label ${i + 1} of ${foundLabelList.length}`);
  }
}

main();
