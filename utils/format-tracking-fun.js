function formatTrackingNumber(trackingNumber) {
  return trackingNumber.match(/.{1,4}/g).join(" ");
}

module.exports = formatTrackingNumber;
