﻿window.onload = function () {
  mdc.autoInit();
  $(".dialog-mask").hide();
};

//some useful variables
var currentColor = "";
var rawImg = "";
var TempImage = "images/assets/picker.jpg";
var ImageLength = 0;
var general_to_crop;
var templateMaxSize = 1080;

//gbebodi
$(document).ready(function () {
  $.getJSON(
    "https://api.countapi.xyz/get/devfestavatar.web.app/counts",
    function (response) {
      $("#foot").text(response.value);
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

  //Add the template Image
  general_to_crop.cropme("bind", {
    url: TempImage,
    position: {
      scale: 1,
    },
  });

  //Pick a random color from the available buttons on page load
  var colors = ["blue", "green", "pink", "yellow", "date", "general"];
  var randomColor = colors[Math.floor(Math.random() * colors.length)];
  var template = 'images/avatar/' + randomColor + '.jpg';
  TempImage = template;
  if (general_to_crop) {
    general_to_crop.cropme('bind', {
      url: TempImage,
      position: { scale: 1 },
    });
    toastr.info('Random template applied: ' + randomColor);
  }

  //Handles click by color buttons for circular avatars
  $(".color-btn").on("click", function () {
    currentColor = $(this).data("color");
    //Use template image from images/avatar/{color}.jpg
    var template = "images/avatar/" + currentColor + ".jpg";
    TempImage = template;
    if (general_to_crop) {
      general_to_crop.cropme("bind", {
        url: TempImage,
        position: { scale: 1 },
      });
      toastr.success("Template applied: " + currentColor);
    }
  });

  //Process the chosen color
  //Step 1:  Crop the image from the  ViewPort within the Container
  //Step 2:  Perform the Join
  function DownloadColor() {
    var directory = "images/";
    var template = directory.concat(
      "template-",
      currentColor,
      ".png"
    );

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
        width: ImageLength,
      })
      .then(function (output) {
        //Stitch Image
        console.log("about to stitch");

        //position the crop output relative to the resolved width.
        var finalImageLength = (90.62962962962963 / 100) * ImageLength;

        var outputX = (6.16046296296296 / 100) * ImageLength;
        var outputY = (4.2025 / 100) * ImageLength;

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
              height: ImageLength,
              width: ImageLength,
            },
          ],
          {
            width: ImageLength,
            height: ImageLength,
          }
        ).then((b64) => {
          $("#downloadimg").attr({
            href: URL.createObjectURL(base64toBlob(b64)),
            download: "DevFestMe-" + getFormattedTime() + ".png",
          });

          ShowLoading(false);
          $("#downloadimg").get(0).click();
          toastr.success("Downloading");

          $.getJSON(
            "https://api.countapi.xyz/hit/devfestavatar.web.app/counts",
            function (response) {
              $("#foot").text(response.value);
            }
          );
        });
      });
  }

  //Handle click from Upload input
  $("input:file").change(function () {
    console.log($(this).val());
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
          if (ImageLength > templateMaxSize) {
            ImageLength = templateMaxSize;
          }
          // console.log(ImageLength);
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

var $uploadCrop;

/* eslint-env browser */
(function () {
  "use strict";

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === "[::1]" ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
  );

  if (
    "serviceWorker" in navigator &&
    (window.location.protocol === "https:" || isLocalhost)
  ) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(function (registration) {
        // updatefound is fired if service-worker.js changes.
        registration.onupdatefound = function () {
          // updatefound is also fired the very first time the SW is installed,
          // and there's no need to prompt for a reload at that point.
          // So check here to see if the page is already controlled,
          // i.e. whether there's an existing service worker.
          if (navigator.serviceWorker.controller) {
            // The updatefound event implies that registration.installing is set:
            // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
            var installingWorker = registration.installing;

            installingWorker.onstatechange = function () {
              switch (installingWorker.state) {
                case "installed":
                  // At this point, the old content will have been purged and the
                  // fresh content will have been added to the cache.
                  // It's the perfect time to display a "New content is
                  // available; please refresh." message in the page's interface.
                  break;

                case "redundant":
                  throw new Error(
                    "The installing " + "service worker became redundant."
                  );

                default:
                // Ignore
              }
            };
          }
        };
      })
      .catch(function (e) {
        console.error("Error during service worker registration:", e);
      });
  }

  // Your custom JavaScript goes here
})();
