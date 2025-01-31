const bwipjs = require("bwip-js");
const { formatUPSMaxicodeDate } = require("./format-date");

exports.generateMaxicode = async (foundLabelUPS) => {
  try {
    // const GS = String.fromCharCode(29); // Group Separator
    // const RS = String.fromCharCode(30); // Record Separator
    // const EOT = String.fromCharCode(4); // End of Transmission

    const cleanedTrackingNumber = foundLabelUPS.trackingID.replace(/\s+/g, "");
    const address = foundLabelUPS.to_address1.toUpperCase();
    const city = foundLabelUPS.to_city.toUpperCase();
    const state = foundLabelUPS.to_state.toUpperCase();
    const zipcode = foundLabelUPS.to_zip;
    const weight = foundLabelUPS.weight;
    const date = formatUPSMaxicodeDate(foundLabelUPS.createdAt);

    // Extract parts using substring
    const part1 = cleanedTrackingNumber.substring(0, 2); // "1Z"
    const part2 = cleanedTrackingNumber.substring(2, 8); // "V80W46"
    const part3 = cleanedTrackingNumber.substring(8, 10); // "02"
    const part4 = cleanedTrackingNumber.substring(10); // "36478646"

    const testData = `[)>^03001^02996376810000^029840^029002^0291Z31731818^029UPSN^0296AW085^029021^029^0291/1^0291^029N^029125 KEYS RD^029LIMESTONE^029TN^030^004`;
    const data = `[)>^03001^02996${zipcode}0000^029840^0290${part3}^029${part1}${part4}^029UPSN^029${part2}^029${date}^029^0291/1^029${weight}^029N^029${address}^029${city}^029${state}^030^004`;

    let png = await bwipjs.toBuffer({
      bcid: "maxicode",
      text: data,
      parse: true,
      mode: 2,
      scale: 2,
    });
    return png;
  } catch (e) {
    console.log("Error creating maxicode", e);
  }
};
// [)>�01�96376810000�840�002�1Z31731818�UPSN�6AW085�021��1/1�1�N�125 KEYS RD�LIMESTONE�TN��
// [)>�01�96376810000�840�002�1Z31731818�UPSN�6AW085�021��1/1�1�N�125 KEYS RD�LIMESTONE�TN��
// [)>�01�96376810�840�002�1Z31731818�UPSN�6AW085�021��1/1�1�N�125 KEYS RD�LIMESTONE�TN��

// [)>01963768100008400021Z31731818UPSN6AW0850211/11N125 KEYS RDLIMESTONETN
// [)>01962110800008400021Z80601410UPSN7E06530071/121N237 SEVERN ROMILLERSVILMD
// [)>01966851600008400021Z36478646UPSNV80W460211/11N5421 LA SALLELINCOLNNE

// [)>01963768100008400021Z31731818UPSN6AW0850021/12.5N125 KEYS RDLIMESTONETN
