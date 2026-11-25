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
  try { sh("rsvg-convert --version"); } catch { sh("sudo apt-get update -qq && sudo apt-get install -y -qq librsvg2-bin"); }
  fs.mkdirSync(path.join(root, "assets"), { recursive: true });
  sh("rsvg-convert -w 1024 -h 1024 icon.svg -o assets/icon-only.png");
  sh("rsvg-convert -w 1024 -h 1024 icon-fg.svg -o assets/icon-foreground.png");
  sh("convert -size 1024x1024 xc:'#0E1A2B' assets/icon-background.png");
  sh("npx capacitor-assets generate --android --iconBackgroundColor '#0E1A2B' --iconBackgroundColorDark '#0E1A2B'");
  console.log("patch-android: Holy Bible icon created");
} catch (e) { console.log("patch-android: icon step skipped:", e.message); }
