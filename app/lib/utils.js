mapToArray = function(map) {
  var result = [];
  if (map !== undefined) {
    for (var key in map) {
      if (map.hasOwnProperty(key)) {
        result.push(map[key]);
      }
    }
  }
  return result;
};

arrayToMap = function(array, key) {
  var result = {};
  array.forEach(function(i) {
    if (i.hasOwnProperty(key)) {
      result[i[key]] = i;
    } else {
      debug(i.toString() + ' has no key for: ' + key);
    }
  });
  return result;
};
