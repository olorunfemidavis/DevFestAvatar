
function checkLoginState() {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
}
var fbuid = '';
var isfbsr = false;


 function toDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

function statusChangeCallback(response) {
    console.log(response);
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        fbuid = response.authResponse.userID;
        console.log(fbuid);
        if (isfbsr) {
            //share
            console.log('about to share');

            FB.ui({
                method: 'share',
                href: cloud_url,
                hashtag: '#DevFest'
            }, function (response) { });


            //var isCircle = false;
            //if (currentType === 'o')
            //    isCircle = true;
            //FB.api(
            //    '/' + fbuid +  '/photos',
            //    "POST",
            //    {
            //        "url": "https://res.cloudinary.com/gdgadoekiti/image/upload/v1568137375/3e7c135c31f0456681632808109ed557.png",
            //        "published": "false", "allow_spherical_photo": isCircle,
            //        "caption": "I just created my #DevFest Avatar using: https://devfestavatar.azurewebsites.net"
            //    },
            //    function (response) {
            //        console.log(response);
            //        if (response && !response.error) {
            //            FB.api("/" + response.id, "GET", {
            //                "fields": "link"
            //            }, function (picture) {
            //                    console.log(picture);
            //               // window.location = picture["link"] + "&makeprofile=1";
            //            });
            //        }
            //    }
            //);
           
        }
        else {
            //fetch
            console.log('about to fetch');
         
            FB.api(
                '/' + fbuid + '/picture?type=large&redirect=false',
                function (response) {
                    if (response && !response.error) {
                        console.log(response.data.url);

                        toDataURL(response.data.url, function (dataUrl) {                       
                            currentResult = dataUrl;
                        general_to_crop.cropme('bind', {
                            url: currentResult,
                            viewport: {
                                type: currentFullType,
                                width: 300,
                                height: 300
                            },
                            container: {
                                width: 300,
                                height: 300
                            }
                        });
                        SetWidth = response.data.width;
                        if (response.data.height < response.data.width) {
                            SetWidth = this.height;
                        }
                        console.log(SetWidth);
                        });
                    }
                   
                }
            );
        }
    } else  {
        // The person is logged into Facebook, but not your app.
        console.log('Please log into this app.');
        FB.login();
    } 
}
