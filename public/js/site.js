// Main site logic for DevFest Avatar Creator
// Handles UI, image cropping, merging, Gemini integration, and sharing

window.onload = function () {
  if (window.mdc && typeof mdc.autoInit === "function") {
    mdc.autoInit();
  }
  $(".dialog-mask").hide();
};

var currentColor = "";
var rawImg = "";
var assetImagesCount = 82;
var TempImage = getRandomAssetImage();
var ImageLength = 0;
var general_to_crop;
var hasUserUploadedImage = false;
var currentGeneratedAvatarUrl = "";
var cropFallbackViewportSize = 375;

function getRandomAssetImage() {
  var imageIndex = Math.floor(Math.random() * assetImagesCount) + 1;
  return "images/assets/sample" + padAssetIndex(imageIndex) + ".webp";
}

function padAssetIndex(index) {
  return ("000" + index).slice(-3);
}

function initializeUI() {
  // Initialize CropMe
  general_to_crop = $("#tocrop").cropme();
  hideFramePicker();

  rawImg = TempImage;
  currentColor = "";
  hasUserUploadedImage = false;
  bindImageForCropping(TempImage);

  // Use theme.js for theme handling
  window.setThemeBackground();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', window.setThemeBackground);
}

function getCropViewportSize() {
  var viewport = document.querySelector("#tocrop .viewport");
  return viewport && viewport.offsetWidth ? viewport.offsetWidth : cropFallbackViewportSize;
}

function getInitialCropScale(width, height) {
  var shortestSide = Math.max(1, Math.min(width, height));
  return getCropViewportSize() / shortestSide;
}

function bindImageForCropping(url) {
  return new Promise(function (resolve, reject) {
    var image = new Image();
    image.onload = function () {
      var width = image.naturalWidth || image.width;
      var height = image.naturalHeight || image.height;
      ImageLength = Math.min(width, height);

      general_to_crop.cropme("bind", {
        url: url,
        position: {
          x: 0,
          y: 0,
          scale: getInitialCropScale(width, height),
          angle: 0,
        },
      }).then(resolve);
    };
    image.onerror = reject;
    image.src = url;
  });
}

function setupEventListeners() {
  // Color button click handler
  $(".color-btn").on("click", function () {
    if (!hasUserUploadedImage) {
      toastr.info("Upload a photo first.");
      return;
    }
    currentColor = $(this).data("color");
    $(".color-btn").removeClass("is-active");
    $(this).addClass("is-active");
    if (rawImg !== "") {
      if (currentColor === "gemini") {
        CreateWithGemini();
        return;
      }
      DownloadColor();
    }
  });

  // Image upload handler
  $("input:file").change(function () {
    window.trackImageUpload();
    readFile(this);
  });
  $(".fileInput").click(function () {
    $("input:file").trigger("click");
  });
}

function performDeferredTasks() {
  if (window.i18n && typeof window.i18n.init === 'function') {
    window.i18n.init();
  }

  // Track site visit on every page load
  window.trackSiteVisit();

  // On page load, get current count from Firebase usage/totalImages
  if (window.firebase && window.firebase.database) {
    window.firebase.database().ref(window.yearPrefixKey('usage/totalImages')).once('value').then(function (snapshot) {
      $("#countSpan").text(snapshot.val() || 0);
    });
  }

  $("#language-select").on("change", function (e) {
    if (window.i18n && typeof window.i18n.setLanguage === 'function') {
      window.i18n.setLanguage(e.target.value);
    }
  });
}

function getFormattedTime() {
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth() + 1;
  var d = today.getDate();
  var h = today.getHours();
  var mi = today.getMinutes();
  var s = today.getSeconds();
  return y + "-" + m + "-" + d + "-" + h + "-" + mi + "-" + s;
}

function setGeneratedAvatarPreview(base64Image) {
  if (currentGeneratedAvatarUrl) {
    URL.revokeObjectURL(currentGeneratedAvatarUrl);
  }

  currentGeneratedAvatarUrl = URL.createObjectURL(window.base64toBlob(base64Image));
  var fileName = "DevFestMe-" + getFormattedTime() + ".png";

  $("#downloadimg").attr({
    href: currentGeneratedAvatarUrl,
    download: fileName,
  });
  $("#share-avatar-img").attr("src", currentGeneratedAvatarUrl);
  $("#downloadimg2").attr({
    href: currentGeneratedAvatarUrl,
    download: fileName,
  });
}

// Download avatar with selected color
function DownloadColor() {
  var template = "images/avatar/" + currentColor + ".png";
  if (rawImg === "") {
    toastr.warning("Pick an image");
    return;
  }
  ShowLoading(true);
  general_to_crop
    .cropme("crop", {
      type: "base64",
      width: ImageLength,
    })
    .then(function (output) {
      var finalImageLength = ImageLength;
      var outputX = 0;
      var outputY = 0;
      mergeImages(
        [
          { src: output, x: outputX, y: outputY, height: finalImageLength, width: finalImageLength },
          { src: template, x: 0, y: 0, height: finalImageLength, width: finalImageLength },
        ],
        { width: finalImageLength, height: finalImageLength }
      ).then((b64) => {
        setGeneratedAvatarPreview(b64);
        ShowLoading(false);
        var downloadMsg = (window.i18n && typeof window.i18n.t === 'function')
          ? window.i18n.t('toast_avatar_created', { color: currentColor })
          : 'Avatar ready! Click Download below.';
        toastr.success(downloadMsg);
        if (hasUserUploadedImage) {
          window.trackTotalImagesCreated(function (newCount) {
            $("#countSpan").text(newCount);
          });
          window.trackColorUsage(currentColor);
        }
        $("#share-section").removeAttr("hidden");
        var shareElem = document.getElementById("share-section");
        if (shareElem && typeof shareElem.scrollIntoView === "function") {
          shareElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
}

// Gemini button handler
function CreateWithGemini() {
  if (!rawImg) {
    toastr.warning("No image available for Gemini processing.");
    return;
  }
  ShowLoading(true);
  toastr.info("Editing with Gemini (aka Nano Banana)!");
  processWithGemini(rawImg, function (result) {
    ShowLoading(false);
    if (!result || !result.imageUrl) {
      toastr.error("Gemini did not return a valid image.");
      return;
    }
    toastr.info("Choose a color to download your Gemini-edited avatar!");
    rawImg = result.imageUrl;
    bindImageForCropping(rawImg).catch(function () {
      toastr.error("Could not load the Gemini-edited avatar.");
    });
    if (hasUserUploadedImage) {
      window.trackColorUsage(currentColor);
    }
  });
}

function hideFramePicker() {
  $("#style-picker").attr("hidden", true);
  if (window.i18n && typeof window.i18n.t === 'function') {
    $("#create-heading").text(window.i18n.t('create_title'));
  } else {
    $("#create-heading").text("Upload your photo");
  }
  $(".color-btn").removeClass("is-active");
}

function revealFramePicker() {
  $("#style-picker").removeAttr("hidden");
  if (window.i18n && typeof window.i18n.t === 'function') {
    $("#create-heading").text(window.i18n.t('step_2'));
  } else {
    $("#create-heading").text("Choose a DevFest style");
  }
}

// Read and process uploaded file
// Use image_utils.js for file reading
function readFile(input) {
  window.readImageFile(input, function (dataUrl) {
    rawImg = dataUrl;
    hasUserUploadedImage = true;
    revealFramePicker();
    bindImageForCropping(rawImg).catch(function () {
      toastr.error("Could not load the selected image.");
    });
    if (window.i18n && typeof window.i18n.t === 'function') {
      toastr.success(window.i18n.t('toast_photo_uploaded'));
    }
  });
}

$(document).ready(function () {
  $("img").attr("crossorigin", "anonymous");

  initializeUI();
  setupEventListeners();

  // Defer non-critical tasks to run after the main UI is responsive.
  setTimeout(performDeferredTasks, 100);
});

// Show or hide loading overlay (global)
function ShowLoading(show) {
  let overlayId = "loading-overlay";
  if (show) {
    if (!document.getElementById(overlayId)) {
      let overlay = document.createElement("div");
      overlay.id = overlayId;
      overlay.setAttribute("role", "status");
      overlay.setAttribute("aria-live", "polite");
      overlay.innerHTML = '<div class="loading-spinner"><span class="loading-dot" aria-hidden="true"></span><span>Processing avatar...</span></div>';
      document.body.appendChild(overlay);
    }
    document.body.style.pointerEvents = "none";
  } else {
    let overlay = document.getElementById(overlayId);
    if (overlay) { overlay.remove(); }
    document.body.style.pointerEvents = "auto";
  }
}
