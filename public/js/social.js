// Social sharing and clipboard utilities for DevFest Avatar Creator

/**
 * Opens a social share dialog for the selected platform.
 * @param {string} platform - 'x', 'facebook', or 'linkedin'
 */
async function shareTo(platform) {
  var url = encodeURIComponent('https://devfestavatar.web.app');
  var shareText = "My profile is ready for #DevFest2026.\n\nDevFest returns October 1 - December 31, 2026 with community-led sessions, workshops, and builders everywhere. Create yours: devfestavatar.web.app\n#DevFest #GoogleDeveloperGroups";
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
  const caption = "My profile is ready for #DevFest2026.\n\nDevFest returns October 1 - December 31, 2026 with community-led sessions, workshops, and builders everywhere. Create yours: devfestavatar.web.app\n#DevFest #GoogleDeveloperGroups";
  if (navigator.clipboard) {
    navigator.clipboard.writeText(caption)
      .then(() => { toastr.success('Caption copied!'); })
      .catch(() => { toastr.error('Failed to copy caption.'); });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = caption;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toastr.success('Caption copied!');
    } catch (err) {
      toastr.error('Failed to copy caption.');
    }
    document.body.removeChild(textarea);
  }
}

window.shareTo = shareTo;
window.copyCaption = copyCaption;
