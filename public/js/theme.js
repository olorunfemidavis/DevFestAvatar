// Theme handling for DevFest Avatar Creator

/**
 * Sets the background and text color based on system theme.
 */
function setThemeBackground() {
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) return;
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  themeMeta.setAttribute('content', isDark ? '#101214' : '#f8fafd');
}

window.setThemeBackground = setThemeBackground;
