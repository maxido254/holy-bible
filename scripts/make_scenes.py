"""Turn data/kids/animation-queue.json into new lessons using GitHub Models (free tier).
Needs env GITHUB_TOKEN (a PAT with models:read locally, or the Actions token). Optional MODEL."""
import json, os, re, sys, time, urllib.error, urllib.request, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
Q, L = ROOT / "data/kids/animation-queue.json", ROOT / "data/kids/lessons.json"
MODEL = os.environ.get("MODEL", "openai/gpt-4.1-mini")
FALLBACK = ["openai/gpt-4.1-mini", "openai/gpt-4.1-nano", "openai/gpt-4o-mini"]
TYPES = {"person","sheep","lamb","lion","dove","tree","sun","cloud","star","heart","water","hill"}
ANIMS = {"bob","pulse","drift","rise","tw","spin","sway","hop",""}
HEX = re.compile(r"#[0-9a-fA-F]{6}")
def call(model, ref, text):
    body = json.dumps({"model": model, "temperature": 0.4, "messages": [
        {"role": "system", "content": (ROOT / "scripts/scene_prompt.txt").read_text()},
        {"role": "user", "content": f"Verse: {ref}\n{text}"}]}).encode()
    req = urllib.request.Request("https://models.github.ai/inference/chat/completions", body, {
        "Authorization": "Bearer " + os.environ["GITHUB_TOKEN"], "Content-Type": "application/json",
        "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"})
    out = json.load(urllib.request.urlopen(req, timeout=120))["choices"][0]["message"]["content"]
    return json.loads(re.search(r"\{.*\}", out, re.S).group(0))
def ask(ref, text):
    last = "no model tried"
    for m in [MODEL] + [x for x in FALLBACK if x != MODEL]:
        for attempt in range(2):
            try:
                d = call(m, ref, text); print("  model:", m); return d
            except urllib.error.HTTPError as e:
                last = f"{m}: HTTP {e.code} {e.read().decode('utf-8', 'replace')[:300]}"; print("  ", last)
                if e.code == 429 and attempt == 0: time.sleep(30); continue
                break
    raise RuntimeError(last)
def clean(d):
    items = []
    for it in d["scene"]["items"][:12]:
        if it.get("t") not in TYPES: continue
        o = {"t": it["t"], "x": max(0, min(400, float(it.get("x", 200)))), "y": max(0, min(260, float(it.get("y", 200)))),
             "s": max(0.4, min(2.5, float(it.get("s", 1)))), "anim": it.get("anim") if it.get("anim") in ANIMS else ""}
        o.update({k: it[k] for k in ("skin", "robe", "hair") if HEX.fullmatch(str(it.get(k, "")))})
        items.append(o)
    if not items: raise ValueError("no usable items")
    bg = d["scene"].get("bg"); return {"bg": bg if bg in ("day","night","sunset") else "day", "items": items}, str(d["say"])[:160]
def short(text, n):
    text = text.replace("\u00b6", "").strip()
    return text if len(text) <= n else text[:n].rsplit(" ", 1)[0] + "..."
if __name__ == "__main__":
    if not Q.exists():
        print("No data/kids/animation-queue.json yet. In the app, tap Animate on some verses, export the list from the Kids tab, and upload it to data/kids/animation-queue.json.")
        sys.exit(0)
    lessons = json.loads(L.read_text()); have = {x["id"] for x in lessons}; added = 0; failed = 0
    for q in json.loads(Q.read_text()):
        vs = sorted(q.get("verses") or [1]); first, last = vs[0], vs[-1]
        ref = f"{q['book']} {q['chapter']}:{first}" if first == last else f"{q['book']} {q['chapter']}:{first}-{last}"
        lid = re.sub(r"[^a-z0-9]+", "-", f"{q['book']}-{q['chapter']}-{first}-{last}".lower()).strip("-")
        if lid in have: print("skip (already exists)", ref); continue
        try:
            scene, say = clean(ask(ref, short(q["text"], 700)))
            lessons.append({"id": lid, "ref": ref, "bk": q["book"], "ch": str(q["chapter"]), "v": first, "v2": last, "emoji": "\ud83d\udcd6",
                            "say": say, "verse": short(q["text"], 300), "scene": scene})
            have.add(lid); added += 1; print("ok", ref)
        except Exception as e: failed += 1; print("failed", ref, e)
        time.sleep(5)
    L.write_text(json.dumps(lessons, ensure_ascii=False, indent=1)); print("added", added, "failed", failed)
    if failed and not added: sys.exit(1)
