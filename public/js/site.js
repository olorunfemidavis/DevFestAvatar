window.onload = function () {
  mdc.autoInit();
  $(".dialog-mask").hide();
};

//some useful variables
var currentColor = "";
var rawImg = "";
// Pick a random image from images/assets/sample1.jpg to sample45.jpg for TempImage
var assetImagesCount = 45;
var TempImage = "images/assets/sample" + (Math.floor(Math.random() * assetImagesCount) + 1) + ".jpg";
var ImageLength = 0;
var general_to_crop;

//gbebodi
$(document).ready(function () {
  // On page load, get current count
  $.getJSON(
    "https://abacus.jasoncameron.dev/info/avatar/images",
    function (response) {
      $("#countSpan").text(response.value);
    }
  );

  //just in case of cors wahala
  //edit: 2021: why is this here? check..
  $("img").attr("crossorigin", "anonymous");

  //Useful for unique file naming
  function getFormattedTime() {
    var today = new Date();
    var y = today.getFullYear();
    // JavaScript months are 0-based.
    var m = today.getMonth() + 1;
    var d = today.getDate();
    var h = today.getHours();
    var mi = today.getMinutes();
    var s = today.getSeconds();
    return y + "-" + m + "-" + d + "-" + h + "-" + mi + "-" + s;
  }

  //Initialize CropMe
  general_to_crop = $("#tocrop").cropme();

  // Show picker.png as the default image and scale to fit crop window
  var cropContainerSize = 500; // Default, matches cropme.js
  var cropViewportSize = (3 / 4) * cropContainerSize; // 375px viewport for 500px container
  var imageSize = 500; // TempImage is 500x500px
  var initialScale = cropViewportSize / imageSize; // Scale so image fits viewport
  general_to_crop.cropme("bind", {
    url: TempImage,
    position: {
      scale: initialScale,
    },
  });
  rawImg = TempImage; // Set picker.png as the initial image
  ImageLength = imageSize; // Ensure correct crop/merge size for default image
  currentColor = ""; // No color selected yet

  // Remove automatic template binding and avatar creation on load

  //Handles click by color buttons for circular avatars
  $(".color-btn").on("click", function () {
    currentColor = $(this).data("color");
    // Only trigger avatar generation and download, do not update preview
    if (rawImg !== "") {
      DownloadColor();
    }
  });


  //Process the chosen color
  //Step 1:  Crop the image from the  ViewPort within the Container
  //Step 2:  Perform the Join
  function DownloadColor() {
    // Use correct template path
    var template = "images/avatar/" + currentColor + ".png";
    //Check if an image is chosen.
    if (rawImg === "") {
      toastr.warning("Pick an image");
      return;
    }
    ShowLoading(true);
    //Crop
    general_to_crop
      .cropme("crop", {
        type: "base64",
        width: ImageLength, // Use actual image size or template size
      })
      .then(function (output) {
        //Stitch Image
        var finalImageLength = ImageLength;
        var outputX = 0;
        var outputY = 0;
        mergeImages(
          [
            {
              src: output,
              x: outputX,
              y: outputY,
              height: finalImageLength,
              width: finalImageLength,
            },
            {
              src: template,
              x: 0,
              y: 0,
              height: finalImageLength,
              width: finalImageLength,
            },
          ],
          {
            width: finalImageLength,
            height: finalImageLength,
          }
        ).then((b64) => {
          $("#downloadimg").attr({
            href: URL.createObjectURL(base64toBlob(b64)),
            download: "DevFestMe-" + getFormattedTime() + ".png",
          });
          ShowLoading(false);
          $("#downloadimg").get(0).click();
          toastr.success("Downloading");
          // After successful image generation, increment count
          $.getJSON(
            "https://abacus.jasoncameron.dev/hit/avatar/images",
            function (response) {
              $("#countSpan").text(response.value);
            }
          );

          // Show share section and update content
          $("#share-section").show();
          // Use base64 data URL for universal compatibility
          $("#share-avatar-img").attr("src", b64.startsWith('data:image') ? b64 : 'data:image/png;base64,' + b64.split(',')[1]);
          // Keep blob URL for downloadimg2
          $("#downloadimg2").attr({
            href: URL.createObjectURL(base64toBlob(b64)),
            download: "DevFestMe-" + getFormattedTime() + ".png",
          });
        });
      });
  }

  //Handle click from Upload input
  $("input:file").change(function () {
    readFile(this);
  });

  //Handle click from Upload Label
  $(".fileInput").click(function () {
    $("input:file").trigger("click");
  });

  //Read and process file
  function readFile(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        rawImg = e.target.result;
        general_to_crop.cropme("bind", {
          url: rawImg,
        });
        var image = new Image();
        image.src = rawImg;
        image.onload = function () {
          // access image size here
          ImageLength = this.width;
          if (this.height < this.width) {
            ImageLength = this.height;
          }
        };
      };
      reader.readAsDataURL(input.files[0]);
    } else {
      toastr.info("No Input.");
    }
  }

  function ShowLoading(show) {
    if (show == true) $(".dialog-mask").show().removeClass("collapse");
    else $(".dialog-mask").hide().addClass("collapse");
  }

  function base64toBlob(base64Data) {
    if (base64Data.includes(",")) {
      //remove data:image/png;base64, and co.
      base64Data = base64Data.split(",")[1];
    }
    contentType = "image/png";
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

  // Set background color based on system theme
  function setThemeBackground() {
    const mother = document.querySelector('.mother');
    if (!mother) return;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      mother.style.backgroundColor = '#111';
      mother.style.color = '#fff';
    } else {
      mother.style.backgroundColor = '#fff';
      mother.style.color = '#111';
    }
  }
  setThemeBackground();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setThemeBackground);
});

async function shareTo(platform) {
  var url = encodeURIComponent('https://devfestavatar.web.app');
  var shareText = "Build Safe, Secure and Scalable Solutions with AI and Cloud. My avatar is ready for #DevFest2025!\n\nLet's connect, learn, and build innovative, scalable, and ethically sound applications. Create yours: devfestavatar.web.app\n#DevFest #AI #GoogleCloud";
  var xText = encodeURIComponent(shareText + " via @olordavis, @gdgadoekiti");
  var linkedinText = encodeURIComponent(shareText + " via @olorunfemidavis, @gdgadoekiti");
  var facebookText = encodeURIComponent(shareText);
  var shareUrl = '';

  switch (platform) {
    case 'x':
      shareUrl = `https://x.com/intent/tweet?text=${xText}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/feed/?shareActive&mini=true&text=${linkedinText}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${facebookText}`;
      break;
    default:
      return;
  }

  window.open(shareUrl, '_blank');
}

function copyCaption() {
  const caption = "Build Safe, Secure and Scalable Solutions with AI and Cloud. My avatar is ready for #DevFest2025!\n\nLet's connect, learn, and build innovative, scalable, and ethically sound applications. Create yours: devfestavatar.web.app\n#DevFest #AI #GoogleCloud";
  if (navigator.clipboard) {
    navigator.clipboard.writeText(caption)
      .then(() => {
        toastr.success('Caption copied!');
      })
      .catch(err => {
        console.error('[CopyCaption] Clipboard error:', err);
        toastr.error('Failed to copy caption.');
      });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = caption;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toastr.success('Caption copied!');
    } catch (err) {
      console.error('[CopyCaption] execCommand error:', err);
      toastr.error('Failed to copy caption.');
    }
    document.body.removeChild(textarea);
  }
}
