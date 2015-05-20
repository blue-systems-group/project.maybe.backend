dotEncode = function(string) {
  return string.replace(/\./g, '\u2024');
};

dotDecode = function(string) {
  return string.replace(/\u2024/g, '.');
};
