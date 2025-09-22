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
 * Supports HEIC/HEIF conversion using heic2any.
 * @param {HTMLInputElement} input
 * @param {function} callback
 */
function readImageFile(input, callback) {
  if (input.files && input.files[0]) {
    var file = input.files[0];
    var ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'heic' || ext === 'heif') {
      // Show loading while converting
      if (typeof ShowLoading === 'function') ShowLoading(true);
      if (typeof heic2any !== 'undefined') {
        heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9
        }).then(function (convertedBlob) {
          var reader = new FileReader();
          reader.onload = function (e) {
            if (typeof ShowLoading === 'function') ShowLoading(false);
            callback(e.target.result);
          };
          reader.readAsDataURL(convertedBlob);
        }).catch(function (err) {
          if (typeof ShowLoading === 'function') ShowLoading(false);
          toastr.error("Failed to convert HEIC/HEIF image.");
        });
      } else {
        if (typeof ShowLoading === 'function') ShowLoading(false);
        toastr.error("HEIC/HEIF support not loaded.");
      }
    } else {
      var reader = new FileReader();
      reader.onload = function (e) {
        callback(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  } else {
    toastr.info("No Input.");
  }
}

window.base64toBlob = base64toBlob;
window.readImageFile = readImageFile;
