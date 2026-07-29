# DevFestAvatar

DevFestAvatar is a lightweight web app for creating DevFest 2026 profile images. Users upload a photo, pick a DevFest frame, then download or share the result. The standard avatar flow runs in the browser; the optional Gemini mode uses Firebase Functions for image editing.

Live app: [https://devfestavatar.web.app](https://devfestavatar.web.app)

<img src="public/images/icons/logos/wide.png" width="400" alt="DevFestAvatar logo">

## Features

- Upload, crop, frame, download, and share DevFest avatars.
- DevFest 2026 print-artifact inspired interface with light and dark theme support.
- Responsive layout for phones, tablets, laptops, and large monitors.
- Optional Gemini image edit flow through Firebase Functions.

## Project Structure

```text
public/                 Static web app
public/css/             Split frontend styles
public/js/              Browser-side app logic
functions/              Firebase Functions API
```

## Local Development

Serve the static app:

```powershell
http-server ./public -p 8081
```

Open the URL printed by `http-server`.

## Functions

The Firebase function code requires Node.js 22.

```powershell
cd functions
npm install
npm run serve
```

Gemini image editing expects:

```text
GEMINI_API_KEY
```

Firebase deploy loads function environment values from `functions/.env`. Keep the local `GEMINI_API_KEY` in that file current before deploying, and never commit the file.

The Gemini implementation is split into small modules under `functions/gemini/` for config, validation, prompt text, background loading, and response parsing.

## Deployment

Deploy hosting and functions with Firebase CLI:

```powershell
firebase deploy
```

Deploy functions only:

```powershell
cd functions
npm run deploy
```

## Contributing

Contributions are welcome. Keep changes small, test the browser flow on mobile and desktop, and avoid committing generated local-only artifacts.

Full documentation is in the [Wiki](https://github.com/olorunfemidavis/DevFestAvatar/wiki).
