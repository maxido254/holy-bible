"""Turn data/kids/animation-queue.json into new lessons using GitHub Models (free tier).
Needs env GITHUB_TOKEN (a PAT with models:read locally, or the Actions token). Optional MODEL."""
import json, os, re, time, urllib.request, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
Q, L = ROOT / "data/kids/animation-queue.json", ROOT / "data/kids/lessons.json"
MODEL = os.environ.get("MODEL", "openai/gpt-4.1-mini")
TYPES = {"person","sheep","lamb","lion","dove","tree","sun","cloud","star","heart","water","hill"}
ANIMS = {"bob","pulse","drift","rise","tw","spin","sway","hop",""}
HEX = re.compile(r"#[0-9a-fA-F]{6}")
def ask(ref, text):
    body = json.dumps({"model": MODEL, "temperature": 0.4, "messages": [
        {"role": "system", "content": (ROOT / "scripts/scene_prompt.txt").read_text()},
        {"role": "user", "content": f"Verse: {ref}\n{text}"}]}).encode()
    req = urllib.request.Request("https://models.github.ai/inference/chat/completions", body, {
        "Authorization": "Bearer " + os.environ["GITHUB_TOKEN"], "Content-Type": "application/json",
        "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"})
    out = json.load(urllib.request.urlopen(req, timeout=120))["choices"][0]["message"]["content"]
    return json.loads(re.search(r"\{.*\}", out, re.S).group(0))
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
if __name__ == "__main__":
    lessons = json.loads(L.read_text()); have = {x["id"] for x in lessons}; added = 0
    for q in json.loads(Q.read_text()):
        lid = re.sub(r"[^a-z0-9]+", "-", q["ref"].lower()).strip("-")
        if lid in have: continue
        try:
            scene, say = clean(ask(q["ref"], q["text"]))
            lessons.append({"id": lid, "ref": q["ref"], "emoji": "📖", "say": say, "verse": q["text"], "scene": scene})
            have.add(lid); added += 1; print("ok", q["ref"])
        except Exception as e: print("failed", q["ref"], e)
        time.sleep(5)
    L.write_text(json.dumps(lessons, ensure_ascii=False, indent=1)); print("added", added)
