// Runs automatically after `npx cap sync` (npm script hook "capacitor:sync:after").
// 1) adds the microphone permission so users can record their own voice
// 2) builds the Holy Bible launcher icon from icon.svg / icon-fg.svg
// It never fails the build: any problem is just printed.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const root = process.cwd();
const sh = c => cp.execSync(c, { stdio: "inherit", cwd: root });

try {
  const man = path.join(root, "android/app/src/main/AndroidManifest.xml");
  let x = fs.readFileSync(man, "utf8");
  const add = ["android.permission.RECORD_AUDIO", "android.permission.MODIFY_AUDIO_SETTINGS"]
    .filter(p => !x.includes(p)).map(p => `    <uses-permission android:name="${p}" />\n`).join("");
  // Android 11+ hides other apps unless declared; without this the phone's speech engine can't be found for read-aloud.
  const tts = x.includes("android.intent.action.TTS_SERVICE") ? "" : `    <queries><intent><action android:name="android.intent.action.TTS_SERVICE" /></intent></queries>\n`;
  if (add || tts) { x = x.replace(/<\/manifest>/, add + tts + "</manifest>"); fs.writeFileSync(man, x); console.log("patch-android: updated manifest (microphone permission, speech engine visibility)"); }
} catch (e) { console.log("patch-android: permission step skipped:", e.message); }

try {
  if (!fs.existsSync(path.join(root, "android/app/src/main/res"))) throw new Error("no android project yet");
  // The cross logo PNGs are committed in assets/, so no extra image tools are needed.
  // Only if one is missing do we try to render it from the SVGs.
  const need = [["icon-only.png", "icon.svg"], ["icon-foreground.png", "icon-fg.svg"], ["icon-background.png", "icon-bg.svg"]]
    .filter(([png]) => !fs.existsSync(path.join(root, "assets", png)));
  if (need.length) {
    try { sh("rsvg-convert --version"); } catch { sh("sudo apt-get update -qq && sudo apt-get install -y -qq librsvg2-bin"); }
    fs.mkdirSync(path.join(root, "assets"), { recursive: true });
    need.forEach(([png, svg]) => sh(`rsvg-convert -w 1024 -h 1024 ${svg} -o assets/${png}`));
  }
  sh("npx capacitor-assets generate --android --iconBackgroundColor '#0A1322' --iconBackgroundColorDark '#0A1322'");
  console.log("patch-android: Holy Bible cross icon created");
} catch (e) { console.log("patch-android: icon step skipped:", e.message); }
