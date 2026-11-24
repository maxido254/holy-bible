// Downloads Bibles in the browser/app and keeps them on the device (IndexedDB).
// English (public domain): github.com/scrollmapper/bible_databases. Swahili: eBible.org Swahili Unlocked Literal Bible (CC BY-SA 4.0).
// If a source changes its layout, edit SRC / BASES / SWA_URLS.
const BibleDL=(()=>{
const SRC={KJV:["KJVPCE","KJV"],ASV:["ASV"],YLT:["YLT"],BBE:["BBE"],NHEB:["NHEB"]};
const NAME={KJV:"King James Version",ASV:"American Standard Version",YLT:"Young's Literal Translation",BBE:"Bible in Basic English",NHEB:"New Heart English Bible",SWA:"Biblia Takatifu (Kiswahili)"};
const IDS=["KJV","ASV","YLT","BBE","NHEB","SWA"];
const BASES=["https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/","https://raw.githubusercontent.com/scrollmapper/bible_databases/2025/formats/json/"];
const SWA_URLS=["https://ebible.org/Scriptures/swhulb_vpl.zip"];
const SWA_NOTE="Biblia Takatifu, Swahili Unlocked Literal Bible. © 2019 Door43 World Missions Community. Licensed CC BY-SA 4.0 (creativecommons.org/licenses/by-sa/4.0). Source: ebible.org/swhulb";
const EN=["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const TAGS=/<[^>]*>|\{[^}]*\}/g;
const clean=t=>String(t).replace(TAGS,"").replace(/\s+/g," ").trim();
const verses=c=>{if(c&&!Array.isArray(c))c=c.verses||[];return(c||[]).map(v=>clean(typeof v==="string"?v:(v.text??v.t??"")))};
function parse(raw){const books=Array.isArray(raw)?raw:(raw.books||[]);return books.map(b=>({name:b.name||"",chapters:(b.chapters||[]).map(verses)}))}
const db=()=>new Promise((ok,no)=>{const r=indexedDB.open("onebible",1);r.onupgradeneeded=()=>r.result.createObjectStore("bibles",{keyPath:"id"});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function load(){try{const d=await db();const all=await new Promise((ok,no)=>{const q=d.transaction("bibles").objectStore("bibles").getAll();q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)});return all.sort((a,b)=>IDS.indexOf(a.id)-IDS.indexOf(b.id))}catch{return[]}}
async function save(rec){const d=await db();return new Promise((ok,no)=>{const t=d.transaction("bibles","readwrite");t.objectStore("bibles").put(rec);t.oncomplete=ok;t.onerror=()=>no(t.error)})}
async function english(id){for(const base of BASES)for(const f of SRC[id]){try{
 const res=await fetch(base+f+".json");if(!res.ok)continue;
 const raw=JSON.parse((await res.text()).replace(/^\uFEFF/,""));const books=parse(raw);
 const n=books.reduce((s,b)=>s+b.chapters.reduce((x,c)=>x+c.length,0),0);
 if(books.length!==66||n<20000)continue;
 await save({id,name:NAME[id],books});return true}catch{}}return false}
// Reads the largest file in a zip (stored or deflate) and returns its text.
async function unzipLargest(buf){const dv=new DataView(buf),u8=new Uint8Array(buf);
 let e=buf.byteLength-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw new Error("not a zip");
 const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true),best=null;
 for(let i=0;i<n;i++){const method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),usize=dv.getUint32(p+24,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true);
  if(!best||usize>best.usize)best={method,csize,usize,lo};p+=46+nl+xl+cl}
 if(!best)throw new Error("empty zip");
 const ln=dv.getUint16(best.lo+26,true),lx=dv.getUint16(best.lo+28,true),s=best.lo+30+ln+lx,data=u8.subarray(s,s+best.csize);
 if(best.method===0)return new TextDecoder().decode(data);
 return await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text()}
// Verse-per-line text like "GEN 1:1 text". Books are matched by order of first appearance.
function parseVpl(text){const order=[],by={};
 for(const line of text.split(/\r?\n/)){const m=line.match(/^\s*(.+?)\s+(\d+):(\d+)\s+(.*)$/);if(!m)continue;
  const code=m[1],c=+m[2],v=+m[3];if(!by[code]){by[code]=[];order.push(code)}
  const ch=by[code];while(ch.length<c)ch.push([]);const arr=ch[c-1];while(arr.length<v)arr.push("");arr[v-1]=clean(m[4])}
 const names=order.length===66?EN:order.length===27?EN.slice(39):order.length===39?EN.slice(0,39):null;
 if(!names)throw new Error(order.length+" books found");
 return order.map((code,i)=>({name:names[i],chapters:by[code].map(c=>c.length?c:[""])}))}
async function swahili(){for(const u of SWA_URLS){try{
 const res=await fetch(u);if(!res.ok)continue;
 const books=parseVpl(await unzipLargest(await res.arrayBuffer()));
 const n=books.reduce((s,b)=>s+b.chapters.reduce((x,c)=>x+c.length,0),0);
 if(n<7000)continue;
 await save({id:"SWA",name:NAME.SWA,note:SWA_NOTE,books});return true}catch{}}return false}
async function download(progress){const have=new Set((await load()).map(r=>r.id)),todo=IDS.filter(id=>!have.has(id)),ok=[],failed=[];let i=0;
 for(const id of todo){progress&&progress({id,i:++i,n:todo.length});(await(id==="SWA"?swahili():english(id))?ok:failed).push(id)}
 return{ok,failed}}
return{ids:IDS,load,download}})();
