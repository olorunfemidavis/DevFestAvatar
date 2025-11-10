// Main site logic for DevFest Avatar Creator
// Handles UI, image cropping, merging, Gemini integration, and sharing

window.onload = function () {
  mdc.autoInit();
  $(".dialog-mask").hide();
};

var currentColor = "";
var rawImg = "";
var assetImagesCount = 45;
var TempImage = "images/assets/sample" + (Math.floor(Math.random() * assetImagesCount) + 1) + ".jpg";
var ImageLength = 0;
var general_to_crop;

function initializeUI() {
  // Initialize CropMe
  general_to_crop = $("#tocrop").cropme();

  // Show default image and scale to fit crop window
  var cropContainerSize = 500;
  var cropViewportSize = (3 / 4) * cropContainerSize;
  var imageSize = 500;
  var initialScale = cropViewportSize / imageSize;
  general_to_crop.cropme("bind", {
    url: TempImage,
    position: { scale: initialScale },
  });
  rawImg = TempImage;
  ImageLength = imageSize;
  currentColor = "";

  // Use theme.js for theme handling
  window.setThemeBackground();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', window.setThemeBackground);
}

function setupEventListeners() {
  // Color button click handler
  $(".color-btn").on("click", function () {
    currentColor = $(this).data("color");
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
  // Track site visit on every page load
  window.trackSiteVisit();

  // On page load, get current count from Firebase usage/totalImages
  if (window.firebase && window.firebase.database) {
    window.firebase.database().ref(window.yearPrefixKey('usage/totalImages')).once('value').then(function (snapshot) {
      $("#countSpan").text(snapshot.val() || 0);
    });
  }
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
        $("#downloadimg").attr({
          href: URL.createObjectURL(window.base64toBlob(b64)),
          download: "DevFestMe-" + getFormattedTime() + ".png",
        });
        ShowLoading(false);
        $("#downloadimg").get(0).click();
        toastr.success("Downloading");
        // Increment count in Firebase and update UI
        window.trackTotalImagesCreated(function (newCount) {
          $("#countSpan").text(newCount);
        });
        window.trackColorUsage(currentColor);
        $("#share-section").show();
        $("#share-avatar-img").attr("src", b64.startsWith('data:image') ? b64 : 'data:image/png;base64,' + b64.split(',')[1]);
        $("#downloadimg2").attr({
          href: URL.createObjectURL(window.base64toBlob(b64)),
          download: "DevFestMe-" + getFormattedTime() + ".png",
        });
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
    var image = new Image();
    image.src = rawImg;
    image.onload = function () {
      ImageLength = this.width;
      if (this.height < this.width) {
        ImageLength = this.height;
      }
      general_to_crop.cropme("bind", { url: rawImg });
    };
    window.trackColorUsage(currentColor);
  });
}

// Read and process uploaded file
// Use image_utils.js for file reading
function readFile(input) {
  window.readImageFile(input, function (dataUrl) {
    rawImg = dataUrl;
    general_to_crop.cropme("bind", { url: rawImg });
    var image = new Image();
    image.src = rawImg;
    image.onload = function () {
      ImageLength = this.width;
      if (this.height < this.width) {
        ImageLength = this.height;
      }
    };
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
      overlay.innerHTML = '<div class="loading-spinner">Processing ...</div>';
      document.body.appendChild(overlay);
    }
    document.body.style.pointerEvents = "none";
  } else {
    let overlay = document.getElementById(overlayId);
    if (overlay) { overlay.remove(); }
    document.body.style.pointerEvents = "auto";
  }
}