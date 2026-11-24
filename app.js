const BOOKS=["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const $=s=>document.querySelector(s);
const h=(t,a={},...c)=>{const e=document.createElement(t);for(const k in a){const v=a[k];if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k.startsWith("on"))e[k]=v;else e.setAttribute(k,v===true?"":v)}c.flat().forEach(x=>{if(x!=null&&x!==false)e.append(x)});return e};
const ls={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const S={vers:[],cur:0,book:"John",ch:"3",sel:new Set(),par:false,tab:"read",play:null,daily:[],lessons:[],hl:ls.get("hl",{}),q:ls.get("q",[]),done:ls.get("done",{})};
function norm(r){const o={id:r.id,name:r.name,books:{}};r.books.forEach((b,i)=>{const nm=r.books.length===66?BOOKS[i]:b.name,cs=b.chapters,ch={};
 (Array.isArray(cs)?cs.map((c,j)=>[j+1,c]):Object.entries(cs)).forEach(([k,c])=>{if(c)ch[k]=c.map((v,j)=>typeof v==="string"?{n:j+1,t:v}:{n:+(v.n??v.verse),t:v.t??v.text})});o.books[nm]=ch});return o}
function toast(t){const e=$("#toast");e.textContent=t;e.hidden=false;setTimeout(()=>e.hidden=true,2200)}
let tm;
function stop(){clearInterval(tm);window.speechSynthesis&&speechSynthesis.cancel()}
function speak(text,o={}){stop();if(!window.speechSynthesis)return toast("Speech isn't supported on this device");
 const u=new SpeechSynthesisUtterance(text),vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));u.voice=vs.find(v=>v.localService)||vs[0]||null;u.rate=o.kid?.85:.95;u.pitch=o.kid?1.25:1;
 let got=false;u.onboundary=e=>{got=true;o.word&&o.word(e.charIndex)};u.onend=u.onerror=()=>{clearInterval(tm);o.end&&o.end()};
 if(o.word){let i=0;const ws=[...text.matchAll(/\S+/g)].map(m=>m.index);tm=setInterval(()=>{if(got)return clearInterval(tm);o.word(ws[Math.min(i++,ws.length-1)])},380)}
 speechSynthesis.speak(u)}
const key=n=>`${S.book}|${S.ch}|${n}`;
const picked=()=>[...S.sel].sort((a,b)=>a-b).map(n=>S.vers[S.cur].books[S.book][S.ch].find(x=>x.n==n)).filter(Boolean);
const keepScroll=()=>{const y=scrollY;render();scrollTo(0,y)};
function mark(c){picked().forEach(x=>{c==null?delete S.hl[key(x.n)]:S.hl[key(x.n)]=c});ls.set("hl",S.hl);S.sel.clear();keepScroll()}
function queue(){const p=picked(),ref=`${S.book} ${S.ch}:${p.map(x=>x.n).join(",")}`;S.q.push({ref,book:S.book,chapter:S.ch,verses:p.map(x=>x.n),text:p.map(x=>x.t).join(" "),version:S.vers[S.cur].id});ls.set("q",S.q);S.sel.clear();keepScroll();toast("Added to the animation list (Kids tab)")}
function copy(){const p=picked();navigator.clipboard&&navigator.clipboard.writeText(`${S.book} ${S.ch}:${p.map(x=>x.n).join(",")} (${S.vers[S.cur].id}) ${p.map(x=>x.t).join(" ")}`);toast("Copied")}
function bar(){const a=$("#act");a.hidden=S.tab!=="read"||!S.sel.size;if(a.hidden)return;
 a.replaceChildren(h("span",{},`${S.sel.size} selected`),h("button",{onclick:()=>speak(picked().map(x=>x.t).join(" "))},"Listen"),...[0,1,2,3].map(i=>h("button",{class:"dot d"+i,"aria-label":"Highlight "+(i+1),onclick:()=>mark(i)})),h("button",{onclick:()=>mark(null)},"Clear"),h("button",{onclick:queue},"Animate"),h("button",{onclick:copy},"Copy"))}
function vbar(){$("#vbar").replaceChildren(...S.vers.map((v,i)=>h("button",{class:"chip"+(i===S.cur?" on":""),title:v.name,onclick:()=>{S.cur=i;render()}},v.id)),S.vers.length>1?h("button",{class:"chip"+(S.par?" on":""),onclick:()=>{S.par=!S.par;render()}},"Parallel"):null)}
const isFull=()=>S.vers.some(v=>Object.keys(v.books).length>=66);
async function getBibles(e){const b=e.currentTarget;b.disabled=true;
 const r=await BibleDL.download(m=>{b.textContent=m});
 if(r.ok.length){S.vers=(await BibleDL.load()).map(norm);S.cur=0;S.sel.clear()}
 toast(r.failed.length?(r.ok.length?`Got ${r.ok.join(", ")}. Failed: ${r.failed.join(", ")}`:"Download failed. Check your internet and try again."):`Downloaded ${r.ok.join(", ")}`);
 render()}
function readView(){const v=S.vers[S.cur],names=BOOKS.filter(b=>v.books[b]);if(!v.books[S.book])S.book=names[0];
 const chs=Object.keys(v.books[S.book]).sort((a,b)=>a-b);if(!chs.includes(S.ch))S.ch=chs[0];
 return h("div",{},isFull()?null:h("div",{style:"margin:.5rem 0"},h("button",{class:"main",onclick:getBibles},"Download the full Bible (KJV, ASV, YLT, BBE, NHEB)"),h("p",{class:"small"},"Free and public domain. Needs internet once, then works offline.")),
 h("div",{class:"pick"},h("select",{"aria-label":"Book",onchange:e=>{S.book=e.target.value;S.ch=null;S.sel.clear();render()}},names.map(n=>h("option",{value:n,selected:n===S.book},n))),h("select",{"aria-label":"Chapter",onchange:e=>{S.ch=e.target.value;S.sel.clear();render()}},chs.map(c=>h("option",{value:c,selected:c===S.ch},c)))),
 h("article",{class:"text"},h("h2",{},`${S.book} ${S.ch}`),v.books[S.book][S.ch].map(x=>{const c=S.hl[key(x.n)];
  return h("p",{class:"v"+(S.sel.has(x.n)?" sel":"")+(c!=null?" hl"+c:""),onclick:e=>{S.sel.has(x.n)?S.sel.delete(x.n):S.sel.add(x.n);e.currentTarget.classList.toggle("sel");bar()}},h("sup",{},x.n)," ",x.t,
   S.par?S.vers.filter((_,i)=>i!==S.cur).map(o=>{const t=(o.books[S.book]?.[S.ch]||[]).find(y=>y.n==x.n);return t&&h("span",{class:"alt"},h("b",{},o.id+" "),t.t)}):null)})))}
function dailyView(){const d=S.daily;if(!d.length)return h("p",{},"No daily studies found. Add some to data/daily.json.");
 const i=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5)%d.length,e=d[i],day=new Date().toISOString().slice(0,10);
 const text=(S.vers[S.cur].books[e.book]?.[e.ch]||[]).filter(x=>x.n>=e.from&&x.n<=e.to).map(x=>x.t).join(" ");
 return h("article",{class:"text"},h("h2",{},e.title),h("p",{class:"ref"},`${e.book} ${e.ch}:${e.from}-${e.to} (${S.vers[S.cur].id})`),h("blockquote",{},text||"This passage isn't in the selected version yet."),text&&h("button",{onclick:()=>speak(text)},"Listen"),
  h("h3",{},"Reflect"),h("p",{},e.note),h("h3",{},"Think about it"),h("p",{},e.question),
  h("button",{class:"main",onclick:()=>{S.done[day]=!S.done[day];ls.set("done",S.done);render()}},S.done[day]?"Done today":"Mark as done"),h("p",{class:"small"},`Days completed: ${Object.values(S.done).filter(Boolean).length}`))}
const stars=[[40,30],[120,60],[330,40],[290,90],[70,170],[350,180]].map(([x,y],i)=>`<circle class="tw" style="animation-delay:${i*.3}s" cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join("");
const sheep=(x,y,d)=>`<g class="bob" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="26" ry="18" fill="#fff"/><circle cx="${x+24}" cy="${y-4}" r="9" fill="#333"/><rect x="${x-14}" y="${y+14}" width="5" height="13" fill="#333"/><rect x="${x+10}" y="${y+14}" width="5" height="13" fill="#333"/></g>`;
const SC={
light:`<svg viewBox="0 0 400 240"><rect width="400" height="240" fill="#0b1030"/><g class="spin" style="transform-origin:200px 120px"><path d="M200 120L120 0H280zM200 120L400 40V200zM200 120L280 240H120zM200 120L0 200V40z" fill="#ffe27a" opacity=".25"/></g><circle class="pulse" cx="200" cy="120" r="46" fill="#fff3b0"/><circle cx="200" cy="120" r="28" fill="#fff"/>${stars}</svg>`,
shepherd:`<svg viewBox="0 0 400 240"><rect width="400" height="240" fill="#8fd3ff"/><circle class="pulse" cx="330" cy="50" r="28" fill="#ffd93b"/><g class="drift"><ellipse cx="60" cy="50" rx="40" ry="14" fill="#fff"/><ellipse cx="90" cy="42" rx="26" ry="12" fill="#fff"/></g><ellipse cx="120" cy="260" rx="260" ry="110" fill="#5cb85c"/><ellipse cx="330" cy="270" rx="220" ry="90" fill="#4aa54a"/>${sheep(110,170,0)}${sheep(210,190,.4)}${sheep(300,165,.8)}</svg>`,
heart:`<svg viewBox="0 0 400 240"><rect width="400" height="240" fill="#ffd6e7"/><path class="pulse" d="M200 215C80 140 90 40 150 40c25 0 42 14 50 32 8-18 25-32 50-32 60 0 70 100-50 175z" fill="#ff4d7d"/><g font-size="26" fill="#ff4d7d"><text class="rise" x="40" y="220">♥</text><text class="rise" style="animation-delay:1.3s" x="340" y="220">♥</text><text class="rise" style="animation-delay:2.4s" x="90" y="230">♥</text><text class="rise" style="animation-delay:.7s" x="300" y="230">♥</text></g></svg>`};
function kidsView(){
 if(S.play){const l=S.play,txt=`${l.say} ${l.verse}`,ws=[...txt.matchAll(/\S+/g)].map(m=>{const s=h("span",{class:"w"},m[0]+" ");s.i=m.index;return s}),on=ci=>ws.forEach(s=>s.classList.toggle("on",s.i<=ci&&ci<s.i+s.textContent.length-1));
  const stage=h("div",{class:"stage"});if(l.video){stage.append(h("video",{src:l.video,controls:true,playsinline:true}))}else stage.innerHTML=typeof l.scene==="object"?KIT.render(l.scene):SC[l.scene]||SC.light;
  return h("div",{},h("button",{onclick:()=>{S.play=null;render()}},"Back"),h("h2",{},l.ref),stage,h("p",{class:"cap"},ws),h("button",{class:"main",onclick:()=>speak(txt,{kid:true,word:on,end:()=>on(-1)})},"Read to me"))}
 return h("section",{},h("h2",{},"Sunday school"),h("div",{class:"grid"},S.lessons.map(l=>h("button",{class:"lesson",onclick:()=>{S.play=l;render()}},h("b",{},l.emoji),l.ref))),
  h("h3",{},`Verses waiting to be animated (${S.q.length})`),h("p",{class:"small"},"Pick verses in Read and tap Animate. Export the list, make the cartoons online, then add them to data/kids/lessons.json."),
  S.q.length?h("div",{},S.q.map(q=>h("p",{class:"small"},`${q.ref} (${q.version})`)),h("button",{class:"main",onclick:()=>{const a=h("a",{href:URL.createObjectURL(new Blob([JSON.stringify(S.q,null,2)],{type:"application/json"})),download:"animation-queue.json"});a.click()}},"Export list"),h("button",{onclick:()=>{S.q=[];ls.set("q",[]);render()}},"Clear list")):null)}
function render(){stop();document.body.className=S.tab;$("#main").replaceChildren(S.tab==="read"?readView():S.tab==="daily"?dailyView():kidsView());vbar();bar();document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.t===S.tab))}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;S.play=null;render();scrollTo(0,0)});
(async()=>{const j=async u=>{try{return await(await fetch(u)).json()}catch{return null}};
 const man=await j("data/versions.json");for(const f of(man&&man.files&&man.files.length?man.files:[])){const r=await j(f);if(r)S.vers.push(norm(r))}
 if(!S.vers.length)(await BibleDL.load()).forEach(r=>S.vers.push(norm(r)));
 if(!S.vers.length){const r=await j("data/sample.json");if(r)S.vers.push(norm(r))}
 S.daily=await j("data/daily.json")||[];S.lessons=await j("data/kids/lessons.json")||[];render();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js")})();
