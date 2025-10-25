// capitalize the first letter of the entire string
function capitalizeFirstLetter(string = "") {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// capitalize the first letter of each word in the string
function capitalizeWords(string = "") {
  return string
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

module.exports = {
  capitalizeFirstLetter,
  capitalizeWords
};
