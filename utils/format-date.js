function formatDate(isoString) {
  const date = new Date(isoString);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

function formatDateEasyPost(isoString) {
  const date = new Date(isoString);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${month} - ${day} - ${year}`;
}

module.exports = formatDate;
module.exports = formatDateEasyPost;
