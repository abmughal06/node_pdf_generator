exports.formatDate = (isoString) => {
  const date = new Date(isoString);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};
exports.formatDateShippo = (isoString) => {
  const date = new Date(isoString);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  // const year = date.getFullYear();
  const year2 = date.getFullYear().toString().slice(-2);

  return `${month}/${day}/${year2}`;
};
exports.formatDateEasypostNew = (isoString) => {
  const date = new Date(isoString);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

exports.formatUPSDate = (isoString) => {
  const date = new Date(isoString);

  const allMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthNumber = date.getMonth();
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day} ${allMonths[monthNumber]} ${year}`;
};

exports.formatUPSMaxicodeDate = (isoString) => {
  const date = new Date(isoString);

  // const monthNumber = date.getMonth();
  const day = date.getDate().toString().padStart(3, "0");
  // const year = date.getFullYear();

  return `${day}`;
};

exports.formatDateEasyPost = (isoString) => {
  const date = new Date(isoString);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${month} - ${day} - ${year}`;
};

exports.formatDateEasyPostPremium = (isoString) => {
  const date = new Date(isoString);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};
