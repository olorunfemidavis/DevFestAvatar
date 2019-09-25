
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
            //console.log('about to share');

            FB.ui({
                method: 'share',
                href: cloud_url,
                hashtag: '#DevFest'
            }, function (response) { });           
        }
        else {
            //fetch
           // console.log('about to fetch');
         
            FB.api(
                '/' + fbuid + '/picture?type=large&redirect=false',
                function (response) {
                    if (response && !response.error) {
                       // console.log(response.data.url);

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
                            SetWidth = response.data.height;
                        }
                        //console.log(SetWidth);
                        });
                    }
                   
                }
            );
        }
    } else  {
        // The person is logged into Facebook, but not your app.
       // console.log('Please log into this app.');
        FB.login();
    } 
}
