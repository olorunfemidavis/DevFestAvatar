// Firebase usage tracking utilities
// Handles counters for color usage, image uploads, total images, and site visits

function yearPrefixKey(key) {
  var year = new Date().getFullYear();
  return year + '/' + key;
}

var usageTrackingProductionHosts = [
  'devfestavatar.web.app',
  'devfestavatar.firebaseapp.com'
];

function isUsageTrackingEnabled() {
  var params = new URLSearchParams(window.location.search);
  var override = params.get('usageTracking');
  if (override === 'on') return true;
  if (override === 'off') return false;

  return usageTrackingProductionHosts.indexOf(window.location.hostname) !== -1;
}

function canWriteUsage() {
  return isUsageTrackingEnabled() && window.firebase && window.firebase.database;
}

function trackColorUsage(color) {
  if (canWriteUsage()) {
    window.firebase.database().ref(yearPrefixKey('usage/colors/' + color)).transaction(function (count) {
      return (count || 0) + 1;
    });
  }
}

function trackImageUpload() {
  if (canWriteUsage()) {
    window.firebase.database().ref(yearPrefixKey('usage/imageUploads')).transaction(function (count) {
      return (count || 0) + 1;
    });
  }
}

function trackTotalImagesCreated(updateUI) {
  if (canWriteUsage()) {
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
  if (canWriteUsage()) {
    window.firebase.database().ref(yearPrefixKey('usage/siteVisits')).transaction(function (count) {
      return (count || 0) + 1;
    });
  }
}

window.trackColorUsage = trackColorUsage;
window.trackImageUpload = trackImageUpload;
window.trackTotalImagesCreated = trackTotalImagesCreated;
window.trackSiteVisit = trackSiteVisit;
window.isUsageTrackingEnabled = isUsageTrackingEnabled;
window.yearPrefixKey = yearPrefixKey;
