// Social sharing and clipboard utilities for DevFest Avatar Creator

/**
 * Opens a social share dialog for the selected platform.
 * @param {string} platform - 'x', 'facebook', or 'linkedin'
 */
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

/**
 * Copies the default caption to the clipboard.
 */
function copyCaption() {
  const caption = "Build Safe, Secure and Scalable Solutions with AI and Cloud. My avatar is ready for #DevFest2025!\n\nLet's connect, learn, and build innovative, scalable, and ethically sound applications. Create yours: devfestavatar.web.app\n#DevFest #AI #GoogleCloud";
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
