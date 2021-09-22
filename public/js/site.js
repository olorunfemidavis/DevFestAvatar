window.onload = function () {
    // const MDCSnackbar = mdc.snackbar.MDCSnackbar;

    mdc.autoInit();

    // const MDCTooltip = mdc.tooltip.MDCTooltip;
    //const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
    //const tooltip = new mdc.tooltip.MDCTooltip(document.querySelector('.mdc-tooltip'));

    $(".dialog-mask").hide();

};

//not using some of these
var currentType = 'gy';
var currentResult = '';
var TempImage = "images/gy.jpg";
var SetWidth = 0;
var cloudUrl = '';
var general_to_crop;
var cloud_url = '';
var createdcount = 0;


$(document).ready(function () {

    // $.get("https://devfest.azurewebsites.net/api/v2020/image/count", function (data) {
    //     createdcount = data;
    //     if (createdcount > 0) {
    //         $("#foot").append("Stat: " + createdcount + " images created");
    //     }
    // });
    //just in case of cors wahala
    $('img').attr('crossorigin', 'anonymous');

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


    //initial bind
    general_to_crop = $('#tocrop').cropme();
    general_to_crop.cropme('bind', {
        url: TempImage
    });


    $('input:radio').change(function () {
        currentType = $(this).val();
        if (currentResult === '') {
            SetPreset();
        }
    });
    function SetPreset() {
        var directory = 'images/';
        TempImage = directory.concat(currentType, '.jpg');
        general_to_crop.cropme('bind', {
            url: TempImage
        });
    }

    $('input:file').change(function () {
        imageId = $(this).data('id');
        tempFilename = $(this).val();
        console.log(tempFilename);
        readFile(this);
    });

    $('.fileInput').click(function() {
        $('input:file').trigger('click')
    })

    //reader things
    function readFile(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                rawImg = e.target.result;
                currentResult = rawImg;
                general_to_crop.cropme('bind', {
                    url: rawImg
                });
                var image = new Image();
                image.src = rawImg;

                image.onload = function () {
                    // access image size here 
                    SetWidth = this.width;
                    if (this.height < this.width) {
                        SetWidth = this.height;
                    }
                    console.log(SetWidth);
                };
            };
            reader.readAsDataURL(input.files[0]);
        }
        else {
            toastr.info("No Input.");
        }
    }

    function showloading() {
        $(".dialog-mask").show();
        $('.dialog-mask').removeClass('collapse');
    }
    function hideloading() {

        $(".dialog-mask").hide();
        $('.dialog-mask').addClass("collapse");
    }

    $(".export").click(function () {
        if (currentResult === '') {
            toastr.warning('Choose an image first!');
            event.preventDefault();
        }
    });
    $("#finalSubmit").click(function () {
        console.log('su');
        if (currentResult === '') {
            toastr.warning('Choose an image first!');
        }
        else {
            //console.log('submit clicked');
            showloading();
            general_to_crop.cropme('crop', {
                type: 'base64',
                width: SetWidth
            }).then(function (output) {
                // console.log(output);
                //show loading
                UploadImage(output);
            });

        }
    });
    function base64toBlob(base64Data) {
        contentType = 'image/png';
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

    //anyone can plug in here. //https://devfest.azurewebsites.net/api/v2020/image/avatar
    function UploadImage(dat) {
        // $.ajax('https://localhost:5500/api/v2020/image/avatar', {
        $.ajax('https://devfest.azurewebsites.net/api/v2020/image/avatar', {
            data: JSON.stringify({ "type": currentType, "data": dat }),
            contentType: 'application/json',
            // crossDomain: true,
            // headers: {  'Access-Control-Allow-Origin': '*' },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if (data === '') {

                    console.log('try again');

                }
                else {
                    var splite = data.split(",");
                    cloud_url = splite[0];

                    data = splite[1];
                    //  data = 'data:image/png;base64,' + data;
                    TempImage = 'data:image/png;base64,' + data;
                    //set the main view.
                    general_to_crop.cropme('bind', {
                        url: TempImage
                    });
                    // console.log(data);
                    currentResult = 'data:image/png;base64,' + data;
                    // console.log(data);
                    // set buttons for download.

                    //set for share
                    console.log(cloud_url);
                    $('#shareimg').attr('href', cloud_url);
                    //remove disabled property
                    //disabled
                    //$("#elementID").prop("disabled", true);


                    $('#downloadimg').attr({
                        "href": URL.createObjectURL(base64toBlob(data)),
                        "download": 'DevFestAvatar-' + getFormattedTime() + '.png'
                    });

                    $('#downloadimg').get(0).click();
                }
                hideloading();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                hideloading();
            }
        });
    }
});




var $uploadCrop,
    tempFilename,
    rawImg,
    imageId;


/* eslint-env browser */
(function () {
    'use strict';

    // Check to make sure service workers are supported in the current browser,
    // and that the current page is accessed from a secure origin. Using a
    // service worker from an insecure origin will trigger JS console errors. See
    // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
    var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

    if ('serviceWorker' in navigator &&
        (window.location.protocol === 'https:' || isLocalhost)) {
        navigator.serviceWorker.register('service-worker.js')
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
                                case 'installed':
                                    // At this point, the old content will have been purged and the
                                    // fresh content will have been added to the cache.
                                    // It's the perfect time to display a "New content is
                                    // available; please refresh." message in the page's interface.
                                    break;

                                case 'redundant':
                                    throw new Error('The installing ' +
                                        'service worker became redundant.');

                                default:
                                // Ignore
                            }
                        };
                    }
                };
            }).catch(function (e) {
                console.error('Error during service worker registration:', e);
            });
    }

    // Your custom JavaScript goes here
})();
