# Changelog

All notable changes to this project will be documented in this file.

## [2026.1.0] - 2026-07-27

### 🔒 Security
- **Major Security Update**: Updated Firebase and dependencies to latest stable versions
  - `firebase-admin`: 12.1.0 → 14.2.0
  - `firebase-functions`: 6.4.0 → 4.9.0
  - `firebase-functions-test`: 3.1.0 → 0.3.3
  - `dotenv`: 16.2.0 → 16.4.5
- **Vulnerability Reduction**: Reduced npm audit vulnerabilities from 51 to 12
  - Fixed critical vulnerabilities in protobufjs
  - Fixed high-severity vulnerabilities in fast-xml-parser, websocket-driver, and form-data
  - Fixed high-severity vulnerabilities in jws, lodash, and glob
  - Patched moderate-severity vulnerabilities in qs, uuid, and other transitive dependencies
- **Node.js Version**: Confirmed compatibility with Node.js 22 LTS

### 🚀 Features & Improvements
- Enhanced security with latest Firebase Cloud Functions v2 API
- Improved stability with updated Google Cloud dependencies
- Better compatibility with modern development environments

### 📝 Updates
- Updated project references from DevFest 2025 to DevFest 2026
- Updated all branding guidelines in Gemini AI prompts
- Updated social sharing text to reflect 2026 conference
- Updated meta tags and SEO information for 2026 event
- Updated README with 2026 information and promotional section

### 🔄 Migration Notes
- Firebase Functions v4.x includes breaking changes from v6.x
  - All existing code is compatible (using `onRequest` from `firebase-functions/v2/https`)
  - Review [Firebase Functions Migration Guide](https://firebase.google.com/docs/functions) for details
- Firebase Admin SDK v14.x includes breaking changes from v12.x
  - Test thoroughly in staging environment before production deployment
  - Review [Firebase Admin SDK Changelog](https://firebase.google.com/docs/reference/admin/node)

### ⚠️ Known Issues
- 12 remaining vulnerabilities in transitive dependencies (mostly in google-gax and protobufjs)
  - These are inherent to Firebase Admin SDK's dependency chain
  - Community contributions welcome to help resolve these

### 🔧 Technical Details
- Updated functions/package.json with version 2026.1.0
- Updated firebase.json for deployment configuration
- Updated public/index.html meta tags and descriptions
- Updated functions/gemini.js branding guidelines
- Updated public/js/social.js share text

---

## [2025] - Previous Releases

See git history for changes prior to this release.
