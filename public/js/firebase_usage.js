// Firebase usage tracking utilities
// Handles counters for color usage, image uploads, total images, and site visits

function yearPrefixKey(key) {
  var year = new Date().getFullYear();
  return year + '/' + key;
}

function trackColorUsage(color) {
  if (window.firebase && window.firebase.database) {
    window.firebase.database().ref(yearPrefixKey('usage/colors/' + color)).transaction(function (count) {
      return (count || 0) + 1;
    });
  }
}

function trackImageUpload() {
  if (window.firebase && window.firebase.database) {
    window.firebase.database().ref(yearPrefixKey('usage/imageUploads')).transaction(function (count) {
      return (count || 0) + 1;
    });
  }
}

function trackTotalImagesCreated(updateUI) {
  if (window.firebase && window.firebase.database) {
    var ref = window.firebase.database().ref(yearPrefixKey('usage/totalImages'));
    ref.transaction(function (count) {
      return (count || 0) + 1;
    }, function (error, committed, snapshot) {
      if (committed && snapshot && typeof updateUI === 'function') {
        updateUI(snapshot.val() || 0);
      }
    });
  }
}

function trackSiteVisit() {
  if (window.firebase && window.firebase.database) {
    window.firebase.database().ref(yearPrefixKey('usage/siteVisits')).transaction(function (count) {
      return (count || 0) + 1;
    });
  }
}

window.trackColorUsage = trackColorUsage;
window.trackImageUpload = trackImageUpload;
window.trackTotalImagesCreated = trackTotalImagesCreated;
window.trackSiteVisit = trackSiteVisit;
window.yearPrefixKey = yearPrefixKey;
