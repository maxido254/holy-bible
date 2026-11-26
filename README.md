# OneBible
Installable web app (PWA): several free Bible versions in one place, read-aloud, highlights, daily study, and a Sunday school section with animated cartoon verses for kids.

## Run
The Bibles are already bundled in `data/` (full Genesis to Revelation): KJV, ASV, YLT, BBE, NHEB (English, public domain) and Biblia Takatifu, the Swahili Unlocked Literal Bible (SWA, CC BY-SA 4.0). Nothing needs downloading, and the app works offline.
1. `python -m http.server 8000`, then open http://localhost:8000
2. Host free with GitHub Pages (Settings > Pages > deploy from branch `main`). Install from the browser menu.
3. Android: run the `Build Android app` Action and download the APK. The cross logo in `assets/` is used as the launcher icon (edit `icon.svg`, `icon-fg.svg`, `icon-bg.svg`, then re-render the PNGs).
`scripts/fetch_bibles.py` can still refresh the English files from scrollmapper/bible_databases.

## Features
- Read: choose version, book, chapter. Tap verses to select, then Listen, Highlight (4 colors), Copy, or Animate. "Parallel" shows every version under each verse.
- Highlights are saved on the device and carry across versions.
- Listen uses the device's text-to-speech (in the Android app, the native `@capacitor-community/text-to-speech` plugin, because the Android WebView has no speech of its own). It works offline if an offline voice is installed on the phone.
- Daily: edit `data/daily.json` (add up to 365 entries).
- Kids: lessons in `data/kids/lessons.json`. A lesson's `scene` can be the name of a built-in scene (`light`, `shepherd`, `heart`) or a cartoon scene made from the character kit in `scenes.js`. To use your own video instead, add `"video": "data/kids/media/name.mp4"`.

## Free AI scenes (GitHub Models)
1. In the app: Read > select verses > Animate > Kids > Export list.
2. Save the file as `data/kids/animation-queue.json` and push. The `Make kids scenes` Action asks a free GitHub Models model to arrange the cartoon characters and opens a pull request.
3. Preview the pull request, then merge. Delete scenes you don't like from `data/kids/lessons.json`.
Setup: Settings > Actions > General > allow Actions to create pull requests. Free usage is rate limited, so queue a few verses at a time.
Run locally: `GITHUB_TOKEN=<token with models:read> python scripts/make_scenes.py`.

## Licensing
Only bundle public-domain versions. NIV, ESV, NLT and similar need a publisher license (or a licensed API such as API.Bible).
