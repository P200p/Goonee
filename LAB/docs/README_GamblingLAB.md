# Gambling API Lab — README

This repository contains a learning lab that simulates a gambling API and a "DevTools Simulator" to teach fetch, headers, request forging, and simple scripting.

Files of interest (in `docs/` for GitHub Pages):
- `GamblingAPI_lab.html` — main lab UI
- `gambling-lab.js` — frontend logic and scripts library
- `sw-gamble.js` — service worker that simulates the backend API
- `LAB_SLIDES.html` — short slide deck for workshop
- `WORKSHEET_GamblingLAB.md` — worksheet for students

Publishing to GitHub Pages (quick steps):
1. Commit and push the repo to GitHub.
2. In repository Settings → Pages: set the source to the `gh-pages` branch or `main` branch / `docs` folder (choose `main` → `docs/`).
3. Save and wait a minute — the site will be available at `https://<your-user>.github.io/<repo>/`.

Notes:
- Service Workers require HTTPS to function. GitHub Pages provides HTTPS.
- If you test locally, run a simple static server (for example, `python -m http.server 8000`) and open `http://localhost:8000/docs/GamblingAPI_lab.html`.
- The `manifest.webmanifest` references `icon-192.png` in `docs/` — add a 192px icon there if you want the PWA install prompt to appear.

