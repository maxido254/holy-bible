"""Download public-domain Bibles and write data/<ID>.json + data/versions.json.
Usage: python scripts/fetch_bibles.py   (needs internet; Python 3.8+)
Public domain: KJV, ASV, WEB, YLT, BBE. Check your own country's rules.
Source URLs/formats can change - the parser accepts the common JSON shapes."""
import json, urllib.request, pathlib
OUT = pathlib.Path(__file__).resolve().parent.parent / "data"
NAMES = {"KJV":"King James Version","ASV":"American Standard Version","WEB":"World English Bible","YLT":"Young's Literal Translation","BBE":"Bible in Basic English"}
URLS = ["https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/{}.json"]
def verses(c):
    if isinstance(c, dict): c = c.get("verses", [])
    return [v if isinstance(v, str) else v.get("text", "") for v in c]
def parse(raw):
    books = raw["books"] if isinstance(raw, dict) else raw
    return [{"name": b.get("name", ""), "chapters": [verses(c) for c in b["chapters"]]} for b in books]
done = []
for vid, name in NAMES.items():
    for u in URLS:
        try:
            raw = json.loads(urllib.request.urlopen(u.format(vid), timeout=60).read().decode("utf-8-sig"))
            books = parse(raw)
            if len(books) != 66: raise ValueError(f"{len(books)} books, expected 66")
            (OUT / f"{vid}.json").write_text(json.dumps({"id": vid, "name": name, "books": books}, ensure_ascii=False))
            done.append(f"data/{vid}.json"); print("ok", vid); break
        except Exception as e: print("failed", vid, e)
if done: (OUT / "versions.json").write_text(json.dumps({"files": done}))
