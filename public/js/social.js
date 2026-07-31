// Social sharing and clipboard utilities for DevFest Avatar Creator

function t(key, params) {
  if (window.i18n && typeof window.i18n.t === 'function') {
    return window.i18n.t(key, params);
  }
  return key;
}

/**
 * Opens a social share dialog for the selected platform.
 * @param {string} platform - 'x', 'facebook', or 'linkedin'
 */
async function shareTo(platform) {
  var url = encodeURIComponent('https://devfestavatar.web.app');
  var shareText = t('default_share_caption');
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

/**
 * Copies the default caption to the clipboard.
 */
function copyCaption() {
  const caption = t('default_share_caption');
  const successMsg = t('toast_caption_copied');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(caption)
      .then(() => { toastr.success(successMsg); })
      .catch(() => { toastr.error('Failed to copy caption.'); });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = caption;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toastr.success(successMsg);
    } catch (err) {
      toastr.error('Failed to copy caption.');
    }
    document.body.removeChild(textarea);
  }
}

window.shareTo = shareTo;
window.copyCaption = copyCaption;
