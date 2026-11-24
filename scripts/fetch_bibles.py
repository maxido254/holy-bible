"""Download public-domain Bibles and write data/<ID>.json + data/versions.json.
Usage: python scripts/fetch_bibles.py   (needs internet; Python 3.8+)
Public domain: KJV, ASV, YLT, BBE, NHEB. Check your own country's rules.
Source: github.com/scrollmapper/bible_databases. Its file layout may change; edit SOURCES/URLS if a download fails."""
import json, re, urllib.request, pathlib
OUT = pathlib.Path(__file__).resolve().parent.parent / "data"
# id used in the app: (file name at the source, title)
SOURCES = {"KJV": ("KJVPCE", "King James Version"), "ASV": ("ASV", "American Standard Version"),
           "YLT": ("YLT", "Young's Literal Translation"), "BBE": ("BBE", "Bible in Basic English"),
           "NHEB": ("NHEB", "New Heart English Bible")}
URLS = ["https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/{}.json",
        "https://raw.githubusercontent.com/scrollmapper/bible_databases/2025/formats/json/{}.json"]
TAGS = re.compile(r"<[^>]*>|\{[^}]*\}")
def clean(t): return re.sub(r"\s+", " ", TAGS.sub("", t)).strip()
def verses(c):
    if isinstance(c, dict): c = c.get("verses", [])
    return [clean(v if isinstance(v, str) else v.get("text", "")) for v in c]
def parse(raw):
    books = raw["books"] if isinstance(raw, dict) else raw
    return [{"name": b.get("name", ""), "chapters": [verses(c) for c in b["chapters"]]} for b in books]
done = []
for vid, (src, title) in SOURCES.items():
    for u in URLS:
        try:
            raw = json.loads(urllib.request.urlopen(u.format(src), timeout=60).read().decode("utf-8-sig"))
            books = parse(raw)
            if len(books) != 66: raise ValueError(f"{len(books)} books, expected 66")
            (OUT / f"{vid}.json").write_text(json.dumps({"id": vid, "name": title, "books": books}, ensure_ascii=False))
            done.append(f"data/{vid}.json"); print("ok", vid, "|", books[0]["chapters"][0][0][:60]); break
        except Exception as e: print("failed", vid, u.format(src), e)
if done: (OUT / "versions.json").write_text(json.dumps({"files": done}))
