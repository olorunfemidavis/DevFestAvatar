// Image utility functions for DevFest Avatar Creator

/**
 * Converts a base64 string to a Blob object.
 * @param {string} base64Data - The base64 string.
 * @returns {Blob}
 */
function base64toBlob(base64Data) {
  if (base64Data.includes(",")) {
    base64Data = base64Data.split(",")[1];
  }
  var contentType = "image/png";
  var sliceSize = 1024;
  var byteCharacters = atob(base64Data);
  var bytesLength = byteCharacters.length;
  var slicesCount = Math.ceil(bytesLength / sliceSize);
  var byteArrays = new Array(slicesCount);
  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    var begin = sliceIndex * sliceSize;
    var end = Math.min(begin + sliceSize, bytesLength);
    var bytes = new Array(end - begin);
    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

/**
 * Reads an uploaded file and returns a data URL via callback.
 * @param {HTMLInputElement} input
 * @param {function} callback
 */
function readImageFile(input, callback) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      callback(e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    toastr.info("No Input.");
  }
}

window.base64toBlob = base64toBlob;
window.readImageFile = readImageFile;
