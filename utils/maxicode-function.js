const bwipjs = require("bwip-js");
const { formatUPSMaxicodeDate } = require("./format-date");

exports.generateMaxicode = async (foundLabelUPS) => {
  try {
    const cleanedTrackingNumber = foundLabelUPS.trackingID.replaceAll(
      /\s+/g,
      ""
    );
    let address = foundLabelUPS.to_address1.toUpperCase().substring(0, 13);
    let city = foundLabelUPS.to_city.toUpperCase().substring(0, 10);
    const state = foundLabelUPS.to_state.toUpperCase();
    const zipcode = foundLabelUPS.to_zip.substring(0, 5);
    const weight = Math.round(foundLabelUPS.weight);
    const date = formatUPSMaxicodeDate(foundLabelUPS.createdAt); // Extract parts using substring
    const part1 = cleanedTrackingNumber.substring(0, 2); // "1Z"
    const part2 = cleanedTrackingNumber.substring(2, 8); // "V80W46"
    const part3 = cleanedTrackingNumber.substring(8, 10); // "02"
    const part4 = cleanedTrackingNumber.substring(10); // "36478646"

    let data = `[)>^03001^02996${zipcode}0000^029840^0290${part3}^029${part1}${part4}^029UPSN^029${part2}^029${date}^029^0291/1^029${weight}^029N^029${address}^029${city}^029${state}^030^004`;

    console.log("data length", data.length);

    // if (data.length < 149) {
    //   console.log("in city condition");
    //   city = foundLabelUPS.to_city
    //     .toUpperCase()
    //     .replaceAll(" ", "")
    //     .substring(0, 20);
    //   console.log("city length", city.length);
    //   data = `[)>^03001^02996${zipcode}0000^029840^0290${part3}^029${part1}${part4}^029UPSN^029${part2}^029${date}^029^0291/1^029${weight}^029N^029${address}^029${city}^029${state}^030^004`;
    // }

    // if (data.length < 149) {
    //   console.log("in address condition");
    //   address = foundLabelUPS.to_address1
    //     .toUpperCase()
    //     .replaceAll(" ", "")
    //     .substring(0, 149 - data.length);

    //   data = `[)>^03001^02996${zipcode}0000^029840^0290${part3}^029${part1}${part4}^029UPSN^029${part2}^029${date}^029^0291/1^029${weight}^029N^029${address}^029${city}^029${state}^030^004`;
    // }

    // console.log("data length", data.length);

    let png = await bwipjs
      .toBuffer({
        bcid: "maxicode",
        text: data,
        parse: true,
        mode: 2,
        scale: 2,
      })
      .catch((e) => {
        console.log("Error creating maxicode", e);
      });
    return png;
  } catch (e) {
    console.log("Error creating maxicode", e);
  }
};

// [)>^03001^02996${zipcode}0000^029840^0290${part3}^029${part1}${part4}^029UPSN^029${part2}^029${date}^029^0291/1^029${weight}^029N^029${address}^029${city}^029${state}^030^004

// [)>03001^02996339910000^029840^029002^0291Z18632352^029UPSN^029007673^029087^029^0291/1^0292^029N^0292553 ASHBURY 029CAPE CORAL^029FL^030^004
// [)>03001^02996598720000^029840^029002^0291Z38647320^029UPSN^02967WR08^029088^029^0291/1^0292^029N^029VILLAGE OF GR^029SHORES^029CA030^004
// [)>01965987200008400021Z27056140UPSN67WR080881/12NVILLAGE OF GRVILLAGE OFCA

// [)>~03001~02996604520000~029840~029002~0291Z14647438~029UPSN~029410E1W~029195~029~0291/1~029~029N~029135Reo~029TAMPA~029FL~030~004
// [)>01964524100008400031Z36672826UPSNV80W460191/12N10017BOLINGBROKEDRWESTCHESTEROH

