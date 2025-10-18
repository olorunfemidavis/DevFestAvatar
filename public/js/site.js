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

$(document).ready(function () {
  // Track site visit on every page load
  window.trackSiteVisit();

  // On page load, get current count from Firebase usage/totalImages
  if (window.firebase && window.firebase.database) {
    window.firebase.database().ref(window.yearPrefixKey('usage/totalImages')).once('value').then(function (snapshot) {
      $("#countSpan").text(snapshot.val() || 0);
    });
  }

  $("img").attr("crossorigin", "anonymous");

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

  // Color button click handler
  $(".color-btn").on("click", function () {
    var clickedColor = $(this).data("color");
    // If user clicked chapter, show the hidden input first and focus it.
    if (clickedColor === 'chapter') {
      currentColor = 'chapter';
      var $chapterInput = $("#chapter-location");
      var $chapterWrap = $(".chapter-wrapper");
      if ($chapterInput.length && $chapterWrap.length) {
        // If currently hidden, show (add visible class) and focus instead of immediately downloading
        if (!$chapterWrap.hasClass('visible')) {
          $chapterWrap.css('display', 'block');
          // small timeout to allow CSS transition
          setTimeout(function () { $chapterWrap.addClass('visible'); }, 10);
          $chapterInput.focus();
          // Disable Apply initially
          $(".chapter-apply").addClass('disabled').attr('disabled', true);
          // Input validation: only letters and spaces, not blank, not starting with space
          $chapterInput.off('input.chapterValidate').on('input.chapterValidate', function () {
            var v = $(this).val();
            var isValid = false;
            if (v && v.length > 0) {
              // must not start with space
              if (/^\s/.test(v)) {
                isValid = false;
              } else {
                // allow letters and spaces only (no digits or punctuation)
                if (/^[A-Za-z\s]+$/.test(v)) {
                  // count alphabetic characters and require at least 2
                  var letters = v.match(/[A-Za-z]/g) || [];
                  if (letters.length >= 2) {
                    isValid = true;
                  }
                }
              }
            }
            var $applyBtn = $(".chapter-apply");
            var $help = $("#chapter-help");
            var $a11y = $("#chapter-a11y");
            if (isValid) {
              $applyBtn.removeClass('disabled').attr('disabled', false);
              $help.text('');
              // announce enable
              $a11y.text('Apply enabled');
              $chapterInput.attr('aria-invalid', 'false');
            } else {
              $applyBtn.addClass('disabled').attr('disabled', true);
              // decide helper message
              if (!v || v.trim().length === 0) {
                $help.text('Please enter at least 2 letters');
                $a11y.text('Apply disabled: input empty');
              } else if (/^\s/.test(v)) {
                $help.text('Please remove leading spaces');
                $a11y.text('Apply disabled: remove leading spaces');
              } else if (!/^[A-Za-z\s]+$/.test(v)) {
                $help.text('Please enter letters only');
                $a11y.text('Apply disabled: please enter letters only');
              } else {
                // must be alphabet-only but less than 2 letters
                $help.text('Please enter at least 2 letters');
                $a11y.text('Apply disabled: enter at least two letters');
              }
              $chapterInput.attr('aria-invalid', 'true');
            }
          });
          // Attach Enter key handler once — only proceed if Apply is enabled
          $chapterInput.off('keydown.chapter').on('keydown.chapter', function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              var $applyBtn = $(".chapter-apply");
              if (!$applyBtn.hasClass('disabled') && !$applyBtn.is('[disabled]')) {
                DownloadColor();
                // hide wrapper after applying
                $chapterWrap.removeClass('visible');
                setTimeout(function () { $chapterWrap.css('display', 'none'); }, 210);
              } else {
                // keep focus for correction
                $chapterInput.focus();
              }
            }
          });
          // Wire cancel button
          $(".chapter-cancel").off('click.chapter').on('click.chapter', function () {
            // hide wrapper and clear input
            $chapterWrap.removeClass('visible');
            setTimeout(function () { $chapterWrap.css('display', 'none'); }, 210);
            $chapterInput.val('');
          });
          // Wire apply button
          $(".chapter-apply").off('click.chapter').on('click.chapter', function () {
            // Ignore if disabled
            if ($(this).hasClass('disabled') || $(this).is('[disabled]')) return;
            // Trigger download/apply
            DownloadColor();
            // hide wrapper after applying
            $chapterWrap.removeClass('visible');
            setTimeout(function () { $chapterWrap.css('display', 'none'); }, 210);
          });
          return; // don't proceed to DownloadColor on the same click
        }
      }
      // If input is already visible, proceed to download only if Apply is enabled
      var $applyBtn = $(".chapter-apply");
      if ($chapterWrap.hasClass('visible')) {
        if ($applyBtn.length && !$applyBtn.hasClass('disabled') && !$applyBtn.is('[disabled]')) {
          // proceed to download
        } else {
          // keep focus for correction and don't submit
          $chapterInput.focus();
          return;
        }
      }
    } else {
      currentColor = clickedColor;
    }

    if (rawImg !== "") {
      if (currentColor === "gemini") {
        CreateWithGemini();
        return;
      }
      DownloadColor();
    }
  });

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
        // If the selected template is 'chapter', check the chapter input and draw it as a transparent overlay
        var sources = [
          { src: output, x: outputX, y: outputY, height: finalImageLength, width: finalImageLength },
          { src: template, x: 0, y: 0, height: finalImageLength, width: finalImageLength },
        ];

        // Helper: create a dataURL canvas with the chapter text positioned under the DevFest title
        function createChapterTextOverlay(text, size) {
          var canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext('2d');
          // Transparent background
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Text style - tune to match template design
          var fontSize = Math.floor(size * 0.06); // ~6% of image size
          ctx.font = 'bold ' + fontSize + 'px Roboto, Arial, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          // Add subtle shadow for legibility
          ctx.shadowColor = 'rgba(0,0,0,0.45)';
          ctx.shadowBlur = Math.floor(fontSize * 0.35);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;
          var padding = Math.floor(size * 0.06);
          // Position: place the chapter text below the DevFest title area (approx 22-28% from top)
          var yPos = Math.floor(size * 0.24);
          var xPos = Math.floor(canvas.width / 2);
          // Truncate text if too long
          var displayText = text || '';
          var maxWidth = canvas.width - padding * 2;
          while (ctx.measureText(displayText).width > maxWidth && displayText.length > 0) {
            displayText = displayText.slice(0, -1);
          }
          ctx.fillText(displayText, xPos, yPos);
          return canvas.toDataURL('image/png');
        }

        if (currentColor === 'chapter') {
          var chapterText = (document.getElementById('chapter-location') || { value: '' }).value || '';
          if (chapterText && chapterText.trim().length > 0) {
            try {
              var overlayDataUrl = createChapterTextOverlay(chapterText.trim(), finalImageLength);
              // place the text overlay above the template so it appears on the final image
              sources.push({ src: overlayDataUrl, x: 0, y: 0, height: finalImageLength, width: finalImageLength });
            } catch (e) {
              // If overlay creation fails, continue without it
              console.error('Failed to create chapter overlay', e);
            }
          }
        }

        mergeImages(sources, { width: finalImageLength, height: finalImageLength }).then((b64) => {
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

  // Image upload handler
  $("input:file").change(function () {
    window.trackImageUpload();
    readFile(this);
  });
  $(".fileInput").click(function () {
    $("input:file").trigger("click");
  });

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

  // Use theme.js for theme handling
  window.setThemeBackground();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', window.setThemeBackground);
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
