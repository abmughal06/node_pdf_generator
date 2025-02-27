const { generateNewUPSID } = require("./generate_ups_tracking");

exports.foundLabel = {
  _id: "66cb646001f951a7abe24563",
  provider: "USPS",
  shippingService: "priority mail",
  weight: 2.5,
  note: "swmsslakmSAKMSLA",
  from_name: "ALI RAZA",
  from_company: "sdadasdasdsadsad",
  from_phone: "03058768505",
  from_address1: "15Nadal  place sadasdasdasdas",
  from_address2: "sadassdasdasd",
  from_city: "Staten island",
  from_state: "NY",
  from_zip: "10314",
  from_country: "USA",
  to_name: "Luis Arroyo Rosado",
  to_company: "DNKASDAD ASDKJNADS ASDK",
  to_phone: "8324263588",
  to_address1:
    "abababababababababaabababababababababaabababadlaksdlasmdsaldslamdslakmdlskdsmldsmalsdmasss ",
  to_address2: "",
  to_city: "Vega Alta",
  to_state: "CA",
  to_zip: "75074",
  to_country: "USA",
  length: 16,
  width: 12,
  height: 10,
  vendor: "Rollo",
  trackingID: "9405501699330019181525",
  userId: "66ca4c75d04c92b1a8798618",
  createdAt: "2024-12-02T17:05:36.847Z",
  updatedAt: "2024-09-05T17:05:36.847Z",
  __v: 0,
};

exports.foundLabelUPS = {
  _id: "66cb646001f951a7abe24563",
  provider: "UPS",
  shippingService: "ups 2nd day air",
  weight: 1,
  note: "swmsslakmSAKMSLA",
  from_name: "Warehouse",
  from_company: "",
  from_phone: "58768505756",
  from_address1: "13531 Beacon St",
  from_address2: "",
  from_city: "Sugarland",
  from_state: "TX",
  from_zip: "77478",
  from_country: "USA",
  to_name: "Kayla Garrison",
  to_company: "",
  to_phone: "8324263588",
  to_address1: "66 Willams Ave",
  to_address2: "",
  to_city: "Newburgh",
  to_state: "NY",
  to_zip: "12550",
  to_country: "USA",
  length: 8,
  width: 8,
  height: 12,
  vendor: "2nd day air",
  trackingID: generateNewUPSID(),
  userId: "66ca4c75d04c92b1a8798618",
  createdAt: "2025-02-01T17:05:36.847Z",
  updatedAt: "2024-09-05T17:05:36.847Z",
  __v: 0,
};

// module.exports = [foundLabel, foundLabelUPS];
