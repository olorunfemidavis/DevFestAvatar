window.onload = function () {

    mdc.autoInit();
    $(".dialog-mask").hide();

};
//not using some of these
var currentType = 's';
var currentFullType = 'square';
var currentColor = 'green';
var currentResult = '';
var TempImage = 'https://res.cloudinary.com/gdgadoekiti/image/upload/v1568137375/3e7c135c31f0456681632808109ed557.png';
var SetWidth = 0;
var cloudUrl = '';
var general_to_crop;
var cloud_url = '';


$(document).ready(function () {

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


    function CropGeneral(method) {
        general_to_crop.cropme(method, {
            viewport: {
                type: currentFullType,
                width: 300,
                height: 300,
                border: {
                    enable: true,
                    width: 2,
                    color: '#fff'
                }
            }
        });
    }

    $('input:radio').change(function () {
        var tp = $(this).val();
        if (tp === 'square') {
            currentType = 's';
            currentFullType = tp;
            CropGeneral('reload');
        }
        else if (tp === 'circle') {
            currentType = 'o';
            currentFullType = tp;
            CropGeneral('reload');
        }
        else {
            currentColor = tp;
            if (currentResult === '') {
                SetPreset();
            }
        }
    });
    function CropTemp(){
        general_to_crop.cropme('bind', {
            url: TempImage
        });
    }
    function SetPreset() {
        switch (currentColor) {
            case 'blue': {
                TempImage = 'https://res.cloudinary.com/gdgadoekiti/image/upload/v1568137274/03d231e019be46af94c83a0ea1e8116b.png';
                CropTemp();
                break;
            }
            case 'yellow': {
                TempImage = 'https://res.cloudinary.com/gdgadoekiti/image/upload/v1568137303/3986557df6d8470390b2d235c5ca5208.png';
                CropTemp();
                break;
            }
            case 'green': {
                TempImage = 'https://res.cloudinary.com/gdgadoekiti/image/upload/v1568137375/3e7c135c31f0456681632808109ed557.png';
                CropTemp();
                break;
            }
            case 'red': {
                TempImage = 'https://res.cloudinary.com/gdgadoekiti/image/upload/v1568137205/80e005c2010b47768406aec11e4e87dd.png';
                CropTemp();
                break;
            }
            default:
            // code block
        }
    }

    $('input:file').change(function () {
        imageId = $(this).data('id');
        tempFilename = $(this).val();
        readFile(this);
    });
   
    //reader things
    function readFile(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                rawImg = e.target.result;
                currentResult = rawImg;
                CropGeneral('bind');
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
        else {
            // console.log($(this).attr('title'));

            switch ($(this).attr('title')) {
                case 'Facebook': {
                    isfbsr = true;
                    FB.ui({
                        method: 'share_open_graph',
                        action_type: 'og.likes',
                        action_properties: JSON.stringify({
                            object: cloud_url,
                        })
                    }, function (response) {
                        // Debug response (optional)
                        // console.log(response);
                    });

                    //checkLoginState();
                    break;
                }
                default:
            }
        }
    });
    $("#finalSubmit").click(function () {
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

    function UploadImage(dat) {
        $.ajax('https://devfest.azurewebsites.net/image/processstring', {
            data: JSON.stringify({ "type": currentColor + currentType, "data": dat }),
            contentType: 'application/json',
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
                    TempImage = 'data:image/png;base64,' + data;
                    //set the main view.
                    CropGeneral('bind');
                    currentResult = 'data:image/png;base64,' + data;
                    // set buttons for download.

                    //set for share
                    console.log(cloud_url);
                    $('#shareimg').attr('href', cloud_url);
                    //remove disabled property
                    //disabled


                    $('#downloadimg').attr({
                        "href": URL.createObjectURL(base64toBlob(data)),
                        "download": 'DevFestExport-' + getFormattedTime() + '.png'
                    });

                    $('#downloadimg').get(0).click();

                    // $('#downloadimg').click();
                    //set buttons for whatsapp
                    // $('#whatsappimg').attr('href', 'whatsapp://send?text=' + encodeURIComponent(data));

                    //set for facebook.

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
