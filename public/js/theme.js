// Theme handling for DevFest Avatar Creator

/**
 * Sets the background and text color based on system theme.
 */
function setThemeBackground() {
  const mother = document.querySelector('.mother');
  if (!mother) return;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    mother.style.backgroundColor = '#111';
    mother.style.color = '#fff';
  } else {
    mother.style.backgroundColor = '#fff';
    mother.style.color = '#111';
  }
}

window.setThemeBackground = setThemeBackground;
