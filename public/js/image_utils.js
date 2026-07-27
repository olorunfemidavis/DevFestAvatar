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

var heicConverterPromise = null;

function loadHeicConverter() {
  if (typeof heic2any !== 'undefined') {
    return Promise.resolve();
  }
  if (heicConverterPromise) {
    return heicConverterPromise;
  }

  heicConverterPromise = new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = 'js/heic2any.min.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = function () {
      heicConverterPromise = null;
      reject(new Error('HEIC/HEIF support could not be loaded.'));
    };
    document.head.appendChild(script);
  });

  return heicConverterPromise;
}

function getFileExtension(fileName) {
  return (fileName.split('.').pop() || '').trim().toLowerCase();
}

function getImageFileKind(file) {
  var ext = getFileExtension(file.name || '');
  var mime = (file.type || '').trim().toLowerCase();

  if (ext === 'heic' || mime === 'image/heic' || mime === 'image/x-heic') {
    return 'heic';
  }
  if (ext === 'heif' || mime === 'image/heif' || mime === 'image/x-heif') {
    return 'heif';
  }

  return ext;
}

function normalizeHeicFile(file, kind) {
  var mimeType = kind === 'heif' ? 'image/heif' : 'image/heic';
  var normalizedExtension = kind === 'heif' ? '.heif' : '.heic';
  var normalizedName = (file.name || 'upload' + normalizedExtension).replace(/\.(heic|heif)$/i, normalizedExtension);

  if (typeof File === 'function') {
    return new File([file], normalizedName, {
      type: mimeType,
      lastModified: file.lastModified || Date.now()
    });
  }

  return new Blob([file], { type: mimeType });
}

function readBlobAsDataUrl(blob, callback) {
  var reader = new FileReader();
  reader.onload = function (e) {
    if (typeof ShowLoading === 'function') ShowLoading(false);
    callback(e.target.result);
  };
  reader.onerror = function () {
    if (typeof ShowLoading === 'function') ShowLoading(false);
    toastr.error("Failed to read image file.");
  };
  reader.readAsDataURL(blob);
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
    var fileKind = getImageFileKind(file);
    if (fileKind === 'heic' || fileKind === 'heif') {
      // Show loading while converting
      if (typeof ShowLoading === 'function') ShowLoading(true);
      loadHeicConverter().then(function () {
        heic2any({
          blob: normalizeHeicFile(file, fileKind),
          toType: "image/jpeg",
          quality: 0.9
        }).then(function (convertedBlob) {
          var outputBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          if (!outputBlob) {
            throw new Error("HEIC/HEIF conversion returned no image.");
          }
          readBlobAsDataUrl(outputBlob, callback);
        }).catch(function (err) {
          if (typeof ShowLoading === 'function') ShowLoading(false);
          if (window.console && console.error) {
            console.error("HEIC/HEIF conversion failed", err);
          }
          toastr.error("This HEIC/HEIF image variant is not supported. Please export it as JPG or PNG and try again.");
        });
      }).catch(function (err) {
        if (typeof ShowLoading === 'function') ShowLoading(false);
        toastr.error(err.message || "HEIC/HEIF support not loaded.");
      });
    } else {
      readBlobAsDataUrl(file, callback);
    }
  } else {
    toastr.info("No Input.");
  }
}

window.base64toBlob = base64toBlob;
window.getImageFileKind = getImageFileKind;
window.readImageFile = readImageFile;
