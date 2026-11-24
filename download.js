// Downloads public-domain Bibles in the browser and keeps them on the device (IndexedDB).
// Source: github.com/scrollmapper/bible_databases (raw files). If the source changes its layout, edit SRC / BASES.
const BibleDL=(()=>{
const SRC={KJV:["KJVPCE","KJV"],ASV:["ASV"],YLT:["YLT"],BBE:["BBE"],NHEB:["NHEB"]};
const NAME={KJV:"King James Version",ASV:"American Standard Version",YLT:"Young's Literal Translation",BBE:"Bible in Basic English",NHEB:"New Heart English Bible"};
const BASES=["https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/","https://raw.githubusercontent.com/scrollmapper/bible_databases/2025/formats/json/"];
const TAGS=/<[^>]*>|\{[^}]*\}/g;
const clean=t=>String(t).replace(TAGS,"").replace(/\s+/g," ").trim();
const verses=c=>{if(c&&!Array.isArray(c))c=c.verses||[];return(c||[]).map(v=>clean(typeof v==="string"?v:(v.text??v.t??"")))};
function parse(raw){const books=Array.isArray(raw)?raw:(raw.books||[]);return books.map(b=>({name:b.name||"",chapters:(b.chapters||[]).map(verses)}))}
const db=()=>new Promise((ok,no)=>{const r=indexedDB.open("onebible",1);r.onupgradeneeded=()=>r.result.createObjectStore("bibles",{keyPath:"id"});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function load(){try{const d=await db();const all=await new Promise((ok,no)=>{const q=d.transaction("bibles").objectStore("bibles").getAll();q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)});const ids=Object.keys(SRC);return all.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id))}catch{return[]}}
async function save(rec){const d=await db();return new Promise((ok,no)=>{const t=d.transaction("bibles","readwrite");t.objectStore("bibles").put(rec);t.oncomplete=ok;t.onerror=()=>no(t.error)})}
async function one(id){for(const base of BASES)for(const f of SRC[id]){try{
 const res=await fetch(base+f+".json");if(!res.ok)continue;
 const raw=JSON.parse((await res.text()).replace(/^\uFEFF/,""));const books=parse(raw);
 const n=books.reduce((s,b)=>s+b.chapters.reduce((x,c)=>x+c.length,0),0);
 if(books.length!==66||n<20000)continue;
 await save({id,name:NAME[id],books});return true}catch{}}return false}
async function download(progress){const ok=[],failed=[];let i=0;const ids=Object.keys(SRC);
 for(const id of ids){progress&&progress(`Downloading ${id} (${++i}/${ids.length})...`);(await one(id)?ok:failed).push(id)}
 return{ok,failed}}
return{load,download}})();
