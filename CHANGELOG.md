# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-07-28

### Performance
- Replaced the previous bundled JPG starter avatars with 82 anonymized 500x500 WebP assets.
- Reduced bundled starter-avatar asset weight to about 3.17 MB.
- Updated random starter-avatar selection to use zero-padded `sample001.webp` through `sample082.webp`.
- Added Firebase Hosting cache headers for `/images/assets/**`.

### Gemini
- Split Gemini image generation code into focused modules for config, validation, background loading, prompt text, and API response handling.
- Updated Gemini image generation request handling to use the current Interactions-style request shape while keeping the frontend response contract unchanged.
- Sanitized bundled Gemini background prompts to remove old named-style wording and leftover clutter details.
- Removed the one-off background sanitizing script after applying the cleanup.

### Cleanup
- Removed the unused `public/images/open_source.png` asset.
- Removed the older `sample1.jpg` through `sample45.jpg` starter avatar assets.

## [Unreleased] - 2026-07-27

### Redesign
- Reworked the landing experience into a focused DevFest Avatar Creator interface.
- Removed the large header/hero row so the page starts with the actual creator flow.
- Introduced a print-artifact inspired layout using DevFest 2026 brand colors, signage borders, agenda-style steps, and responsive panels.
- Added light and dark theme support using the DevFest palette and existing system color preference.
- Improved mobile and desktop responsiveness, including tighter mobile workflow steps and no horizontal overflow at tested viewport sizes.
- Improved mobile Cropme slider visibility, including a clearer rail and larger thumb for touch devices.
- Hid frame choices on initial page load and reveal them only after a user uploads a photo.
- Replaced the old open-source badge image with an inline GitHub icon and text link.

### Architecture
- Split the previous large stylesheet into scoped CSS files:
  - `tokens.css`
  - `base.css`
  - `creator.css`
  - `controls.css`
  - `footer.css`
  - `privacy.css`
  - `responsive.css`
- Vendored required frontend runtime dependencies under `public/vendor` for simpler local development and Playwright testing.

### Privacy
- Added an in-house `privacy.html` page instead of linking to the previous Google Sites privacy page.
- Documented browser-side image framing, Gemini image processing, Firebase aggregate counters, analytics, social sharing, and local file access.
- Left Google Analytics off the privacy page itself.

### Usage Tracking
- Disabled Firebase usage writes on localhost and development hosts by default.
- Added `?usageTracking=on` and `?usageTracking=off` query overrides for testing.
- Prevented bundled sample-image downloads from incrementing created-avatar or frame-usage counters.
- Continued counting real uploaded images and real uploaded-image frame downloads.

### Bug Fixes
- Switched the generated avatar preview to a persistent Blob URL to improve reliability on iOS WebKit browsers.
- Improved the processing overlay contrast and loading affordance in dark mode.
- Normalized HEIC/HEIF upload detection and conversion to handle uppercase extensions and inconsistent browser MIME types.

### Performance
- Removed the large DevFest web header image from the page design.
- Lazy-loaded the HEIC/HEIF converter only when a HEIC or HEIF file is uploaded.
- Kept sample generation and frame creation client-side for the standard avatar flow.

### Verification
- Captured Playwright screenshots for light and dark themes on desktop and mobile.
- Verified no horizontal overflow on tested desktop and mobile viewport sizes.
- Verified sample-image frame downloads do not call usage tracking, while uploaded-image downloads still do.

## [2026.1.0] - 2026-07-27

### Security
- Major security update: updated Firebase and dependencies to latest stable versions.
  - `firebase-admin`: 12.1.0 -> 14.2.0
  - `firebase-functions`: 6.4.0 -> 4.9.0
  - `firebase-functions-test`: 3.1.0 -> 0.3.3
  - `dotenv`: 16.2.0 -> 16.4.5
- Reduced npm audit vulnerabilities from 51 to 12.
  - Fixed critical vulnerabilities in `protobufjs`.
  - Fixed high-severity vulnerabilities in `fast-xml-parser`, `websocket-driver`, and `form-data`.
  - Fixed high-severity vulnerabilities in `jws`, `lodash`, and `glob`.
  - Patched moderate-severity vulnerabilities in `qs`, `uuid`, and other transitive dependencies.
- Confirmed compatibility with Node.js 22 LTS.

### Features And Improvements
- Enhanced security with the latest Firebase Cloud Functions v2 API.
- Improved stability with updated Google Cloud dependencies.
- Improved compatibility with modern development environments.

### Updates
- Updated project references from DevFest 2025 to DevFest 2026.
- Updated all branding guidelines in Gemini AI prompts.
- Updated social sharing text to reflect the 2026 conference.
- Updated meta tags and SEO information for the 2026 event.
- Updated README with 2026 information and promotional section.

### Migration Notes
- Firebase Functions v4.x includes breaking changes from v6.x.
  - Existing code is compatible because it uses `onRequest` from `firebase-functions/v2/https`.
  - Review the [Firebase Functions Migration Guide](https://firebase.google.com/docs/functions) for details.
- Firebase Admin SDK v14.x includes breaking changes from v12.x.
  - Test thoroughly in staging before production deployment.
  - Review the [Firebase Admin SDK Changelog](https://firebase.google.com/docs/reference/admin/node).

### Known Issues
- 12 vulnerabilities remain in transitive dependencies, mostly in `google-gax` and `protobufjs`.
  - These are inherent to Firebase Admin SDK's dependency chain.
  - Community contributions are welcome to help resolve these.

### Technical Details
- Updated `functions/package.json` with version `2026.1.0`.
- Updated `firebase.json` for deployment configuration.
- Updated `public/index.html` meta tags and descriptions.
- Updated `functions/gemini.js` branding guidelines.
- Updated `public/js/social.js` share text.

---

## [2025] - Previous Releases

See git history for changes prior to this release.
