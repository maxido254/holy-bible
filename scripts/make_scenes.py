"""Turn data/kids/animation-queue.json into new lessons using a free AI.
First choice: GitHub Models (needs GITHUB_TOKEN). Backup: Pollinations (no key; only the public verse text is sent).
Optional env MODEL overrides the first GitHub model."""
import json, os, re, sys, time, urllib.error, urllib.parse, urllib.request, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
Q, L = ROOT / "data/kids/animation-queue.json", ROOT / "data/kids/lessons.json"
MODEL = os.environ.get("MODEL", "openai/gpt-4.1-mini")
GH = "https://models.github.ai/inference/chat/completions"
POLL = "https://text.pollinations.ai/openai"
TRIES = [(GH, MODEL), (GH, "openai/gpt-4.1-nano"), (POLL, "openai"), (POLL, "mistral")]
TRUSTED_TOKEN_HOSTS = ("github.ai", "github.com")
TYPES = {"person","sheep","lamb","lion","dove","tree","sun","cloud","star","heart","water","hill"}
ANIMS = {"bob","pulse","drift","rise","tw","spin","sway","hop",""}
HEX = re.compile(r"#[0-9a-fA-F]{6}")
class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
OPENER = urllib.request.build_opener(_NoRedirect)
def host_ok(url, domains): return any((urllib.parse.urlparse(url).hostname or "").endswith(d) for d in domains)
def reply_text(raw):
    raw = raw.strip()
    if raw.startswith("data:"):  # streamed reply
        parts = []
        for line in raw.splitlines():
            line = line.strip()
            if line.startswith("data:") and "[DONE]" not in line:
                try:
                    c = json.loads(line[5:])["choices"][0]
                    parts.append((c.get("delta") or c.get("message") or {}).get("content") or "")
                except Exception: pass
        return "".join(parts)
    return json.loads(raw)["choices"][0]["message"]["content"]
def call(url, model, ref, text):
    body = json.dumps({"model": model, "temperature": 0.4, "messages": [
        {"role": "system", "content": (ROOT / "scripts/scene_prompt.txt").read_text()},
        {"role": "user", "content": f"Verse: {ref}\n{text}"}]}).encode()
    for hop in range(4):
        headers = {"Content-Type": "application/json", "Accept": "application/json", "User-Agent": "holy-bible-scenes"}
        if host_ok(url, TRUSTED_TOKEN_HOSTS):  # the token goes only to GitHub, never to the backup AI
            headers.update({"Authorization": "Bearer " + os.environ["GITHUB_TOKEN"], "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"})
        try:
            resp = OPENER.open(urllib.request.Request(url, body, headers, method="POST"), timeout=120); break
        except urllib.error.HTTPError as e:
            loc = e.headers.get("Location") if e.code in (301, 302, 303, 307, 308) else None
            if not loc: raise
            loc = urllib.parse.urljoin(url, loc); print("   redirected to", loc)
            if not host_ok(loc, TRUSTED_TOKEN_HOSTS + ("pollinations.ai",)): raise ValueError("redirect to untrusted host " + loc)
            url = loc
    else: raise ValueError("too many redirects")
    raw = resp.read().decode("utf-8", "replace")
    try:
        out = reply_text(raw)
        return json.loads(re.search(r"\{.*\}", out, re.S).group(0))
    except Exception as e:
        raise ValueError(f"unreadable reply (HTTP {resp.status}, {dict(resp.headers)}): {raw[:200]!r} [{e}]")
def ask(ref, text):
    last = "no model tried"
    for url, m in TRIES:
        for attempt in range(2):
            try:
                d = call(url, m, ref, text); print("  worked:", m, "via", urllib.parse.urlparse(url).hostname); return d
            except urllib.error.HTTPError as e:
                last = f"{m}: HTTP {e.code} {e.read().decode('utf-8', 'replace')[:200]}"; print("  ", last)
                if e.code == 429 and attempt == 0: time.sleep(30); continue
                break
            except Exception as e:
                last = f"{m}: {e}"; print("  ", str(last)[:400]); break
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
        except Exception as e: failed += 1; print("failed", ref, str(e)[:400])
        time.sleep(5)
    L.write_text(json.dumps(lessons, ensure_ascii=False, indent=1)); print("added", added, "failed", failed)
    if failed and not added: sys.exit(1)
