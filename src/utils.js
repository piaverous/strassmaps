const tramColors = {
  A: "#D13326",
  B: "#469DDD",
  C: "#E49635",
  D: "#469C49",
  E: "#8F85BA",
  F: "#9EBF43",
};

export function getTramLineColor(lineLabel) {
  let label = lineLabel;
  if (lineLabel.length > 1) {
    // if tram station is on multiple lines, label looks like A-B-C. We take the last one in alphabetical order.
    label = lineLabel.split("").sort()[lineLabel.length - 1];
  }
  if (tramColors.hasOwnProperty(label)) return tramColors[label];
  else {
    return "#888";
  }
}

export function getTitleCaseStationName(stationName) {
  let name = stationName
    .trim()
    .split(/\s+/)
    .map((word) =>
      word
        .split("-")
        .map((w) => w[0] + w.substr(1).toLowerCase())
        .join(" ")
    )
    .join(" ");
  return name;
}

export function strNoAccent(s) {
  var n = "",
    t = {
      Š: "S",
      š: "s",
      Ž: "Z",
      ž: "z",
      À: "A",
      Á: "A",
      Â: "A",
      Ã: "A",
      Ä: "A",
      Å: "A",
      Æ: "A",
      Ç: "C",
      È: "E",
      É: "E",
      Ê: "E",
      Ë: "E",
      Ì: "I",
      Í: "I",
      Î: "I",
      Ï: "I",
      Ñ: "N",
      Ò: "O",
      Ó: "O",
      Ô: "O",
      Õ: "O",
      Ö: "O",
      Ø: "O",
      Ù: "U",
      Ú: "U",
      Û: "U",
      Ü: "U",
      Ý: "Y",
      Þ: "B",
      ß: "Ss",
      à: "a",
      á: "a",
      â: "a",
      ã: "a",
      ä: "a",
      å: "a",
      æ: "a",
      ç: "c",
      è: "e",
      é: "e",
      ê: "e",
      ë: "e",
      ì: "i",
      í: "i",
      î: "i",
      ï: "i",
      ð: "o",
      ñ: "n",
      ò: "o",
      ó: "o",
      ô: "o",
      õ: "o",
      ö: "o",
      ø: "o",
      ù: "u",
      ú: "u",
      û: "u",
      ý: "y",
      þ: "b",
      ÿ: "y",
    };
  for (var i = 0, j = s.length; i < j; i++) {
    var c = s[i];
    n += t[c] ? t[c] : c;
  }
  return n;
}

/**
 * Function to sort alphabetically an array of objects by some specific key.
 *
 * @param {String} property Key of the object to sort.
 */
export function dynamicSort(property) {
  var sortOrder = 1;

  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }

  return function (a, b) {
    if (sortOrder === -1) {
      return b.properties[property].localeCompare(a.properties[property]);
    } else {
      return a.properties[property].localeCompare(b.properties[property]);
    }
  };
}
