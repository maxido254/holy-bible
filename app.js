const BOOKS=["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const BOOKS_SW=["Mwanzo","Kutoka","Walawi","Hesabu","Kumbukumbu la Torati","Yoshua","Waamuzi","Ruthu","1 Samweli","2 Samweli","1 Wafalme","2 Wafalme","1 Mambo ya Nyakati","2 Mambo ya Nyakati","Ezra","Nehemia","Esta","Ayubu","Zaburi","Methali","Mhubiri","Wimbo Ulio Bora","Isaya","Yeremia","Maombolezo","Ezekieli","Danieli","Hosea","Yoeli","Amosi","Obadia","Yona","Mika","Nahumu","Habakuki","Sefania","Hagai","Zekaria","Malaki","Mathayo","Marko","Luka","Yohana","Matendo ya Mitume","Warumi","1 Wakorintho","2 Wakorintho","Wagalatia","Waefeso","Wafilipi","Wakolosai","1 Wathesalonike","2 Wathesalonike","1 Timotheo","2 Timotheo","Tito","Filemoni","Waebrania","Yakobo","1 Petro","2 Petro","1 Yohana","2 Yohana","3 Yohana","Yuda","Ufunuo wa Yohana"];
const SW={"Read":"Soma","Daily":"Kila siku","Kids":"Watoto","Listen":"Sikiliza","Clear":"Futa","Animate":"Fanya katuni","Copy":"Nakili","selected":"imechaguliwa","Parallel":"Sambamba","Book":"Kitabu","Chapter":"Sura","Highlight":"Angazia","Copied":"Imenakiliwa","Added to the animation list (Kids tab)":"Imeongezwa kwenye orodha ya katuni (kichupo cha Watoto)","Speech isn't supported on this device":"Kifaa hiki hakiauni sauti","Download the Bibles (English + Swahili)":"Pakua Biblia (Kiingereza + Kiswahili)","Free to use. Needs internet once, then works offline.":"Bure. Inahitaji intaneti mara moja, kisha inafanya kazi bila intaneti.","Downloading":"Inapakua","Downloaded":"Imepakuliwa","Got":"Imepakuliwa","Failed":"Imeshindwa","Download failed. Check your internet and try again.":"Kupakua kumeshindwa. Angalia intaneti kisha ujaribu tena.","No daily studies found. Add some to data/daily.json.":"Hakuna masomo ya kila siku. Ongeza kwenye data/daily.json.","This passage isn't in the selected version yet.":"Andiko hili halipo kwenye toleo ulilochagua.","Reflect":"Tafakari","Think about it":"Fikiria","Mark as done":"Weka alama kuwa imekamilika","Done today":"Imekamilika leo","Days completed":"Siku zilizokamilika","Back":"Rudi","Read to me":"Nisomee","Sunday school":"Shule ya Jumapili","Verses waiting to be animated":"Mistari inayosubiri kufanywa katuni","Pick verses in Read and tap Animate. Export the list, make the cartoons online, then add them to data/kids/lessons.json.":"Chagua mistari kwenye Soma kisha bonyeza Fanya katuni. Hamisha orodha, tengeneza katuni mtandaoni, kisha ziongeze kwenye data/kids/lessons.json.","Export list":"Hamisha orodha","Clear list":"Futa orodha","English":"English","Kiswahili":"Kiswahili","Record my voice":"Rekodi sauti yangu","Record":"Rekodi","Stop":"Simamisha","My voice":"Sauti yangu","Delete my recording":"Futa rekodi yangu","Recording saved":"Rekodi imehifadhiwa","Couldn't save the recording":"Imeshindwa kuhifadhi rekodi","Microphone not allowed or not available":"Kipaza sauti hakijaruhusiwa au hakipatikani"};
const $=s=>document.querySelector(s);
const h=(t,a={},...c)=>{const e=document.createElement(t);for(const k in a){const v=a[k];if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k.startsWith("on"))e[k]=v;else e.setAttribute(k,v===true?"":v)}c.flat().forEach(x=>{if(x!=null&&x!==false)e.append(x)});return e};
const ls={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const S={vers:[],cur:0,book:"John",ch:"3",sel:new Set(),par:false,tab:"read",play:null,daily:[],lessons:[],tk:0,recKey:null,lang:ls.get("lang",(navigator.language||"").toLowerCase().startsWith("sw")?"sw":"en"),hl:ls.get("hl",{}),q:ls.get("q",[]),done:ls.get("done",{})};
const t=k=>S.lang==="sw"&&SW[k]||k;
const BN=n=>S.lang==="sw"&&BOOKS.includes(n)?BOOKS_SW[BOOKS.indexOf(n)]:n;
const L=(o,k)=>S.lang==="sw"&&o[k+"_sw"]||o[k];
function lessonVerse(l){if(S.lang==="sw"&&l.bk){const v=S.vers.find(x=>x.id==="SWA"),a=v&&v.books[l.bk]&&v.books[l.bk][l.ch];if(a){const s=a.filter(x=>x.n>=l.v&&x.n<=(l.v2||l.v)).map(x=>x.t).join(" ");if(s)return s}}return l.verse}
function norm(r){const o={id:r.id,name:r.name,note:r.note,books:{}};r.books.forEach((b,i)=>{const nm=r.books.length===66?BOOKS[i]:b.name,cs=b.chapters,ch={};
 (Array.isArray(cs)?cs.map((c,j)=>[j+1,c]):Object.entries(cs)).forEach(([k,c])=>{if(c)ch[k]=c.map((v,j)=>typeof v==="string"?{n:j+1,t:v}:{n:+(v.n??v.verse),t:v.t??v.text}).filter(x=>x.t)});o.books[nm]=ch});return o}
function toast(m){const e=$("#toast");e.textContent=m;e.hidden=false;setTimeout(()=>e.hidden=true,2600)}
let tm,sid=0;
// The Android WebView has no working speechSynthesis, so inside the app we use the native Text-to-Speech plugin.
const nativeTTS=()=>{try{return window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()&&Capacitor.Plugins&&Capacitor.Plugins.TextToSpeech||null}catch{return null}};
function halt(){clearInterval(tm);sid++;window.speechSynthesis&&speechSynthesis.cancel();const n=nativeTTS();if(n)try{n.stop().catch(()=>{})}catch{}Voice.halt()}
function stop(){halt();S.tk++}
function speak(text,o={}){halt();const id=sid,n=nativeTTS();
 if(!n&&!window.speechSynthesis){toast(t("Speech isn't supported on this device"));o.end&&o.end();return}
 const sw=S.lang==="sw",fin=()=>{if(id!==sid)return;clearInterval(tm);o.end&&o.end()};let got=false;
 const timer=()=>{if(o.word){let i=0;const ws=[...text.matchAll(/\S+/g)].map(m=>m.index);tm=setInterval(()=>{if(got)return clearInterval(tm);o.word(ws[Math.min(i++,ws.length-1)])},380)}};
 if(n){timer();n.speak({text,lang:sw?"sw-KE":"en-US",rate:o.kid?.85:.95,pitch:o.kid?1.25:1,volume:1,category:"ambient"}).then(fin,()=>{if(id===sid)toast(t("Speech isn't supported on this device"));fin()});return}
 const u=new SpeechSynthesisUtterance(text),want=sw?/^sw/i:/^en/i,vs=speechSynthesis.getVoices().filter(v=>want.test(v.lang));u.lang=sw?"sw":"en";u.voice=vs.find(v=>v.localService)||vs[0]||null;u.rate=o.kid?.85:.95;u.pitch=o.kid?1.25:1;
 u.onboundary=e=>{got=true;o.word&&o.word(e.charIndex)};u.onend=u.onerror=fin;timer();
 speechSynthesis.speak(u)}
// Plays each item in order: your own recording if you made one, otherwise the phone's voice.
async function listen(items){stop();const my=S.tk;
 for(const it of items){if(S.tk!==my)return;
  if(Voice.has(it.key)){if(!await Voice.play(it.key))return}
  else await new Promise(ok=>speak(it.text,{end:ok}))}}
async function toggleRec(key){
 if(Voice.recording()){const k=S.recKey;S.recKey=null;try{await Voice.stop(k);toast(t("Recording saved"))}catch{toast(t("Couldn't save the recording"))}render();return}
 stop();try{await Voice.start();S.recKey=key;render()}catch{toast(t("Microphone not allowed or not available"))}}
function voiceRow(key){const on=Voice.recording()&&S.recKey===key;
 return h("div",{style:"margin:.4rem 0"},h("button",{class:on?"main":"",onclick:()=>toggleRec(key)},on?"\u25cf "+t("Stop"):"\ud83c\udf99 "+t("Record my voice")),
  Voice.has(key)&&!on?[h("button",{onclick:()=>{stop();Voice.play(key)}},"\u25b6 "+t("My voice")),h("button",{onclick:async()=>{await Voice.remove(key);render()}},t("Delete my recording"))]:null)}
const vkey=n=>`v|${S.vers[S.cur].id}|${S.book}|${S.ch}|${n}`;
const key=n=>`${S.book}|${S.ch}|${n}`;
const picked=()=>[...S.sel].sort((a,b)=>a-b).map(n=>S.vers[S.cur].books[S.book][S.ch].find(x=>x.n==n)).filter(Boolean);
const keepScroll=()=>{const y=scrollY;render();scrollTo(0,y)};
function mark(c){picked().forEach(x=>{c==null?delete S.hl[key(x.n)]:S.hl[key(x.n)]=c});ls.set("hl",S.hl);S.sel.clear();keepScroll()}
function queue(){const p=picked(),ref=`${S.book} ${S.ch}:${p.map(x=>x.n).join(",")}`;S.q.push({ref,book:S.book,chapter:S.ch,verses:p.map(x=>x.n),text:p.map(x=>x.t).join(" "),version:S.vers[S.cur].id});ls.set("q",S.q);S.sel.clear();keepScroll();toast(t("Added to the animation list (Kids tab)"))}
function copy(){const p=picked();navigator.clipboard&&navigator.clipboard.writeText(`${BN(S.book)} ${S.ch}:${p.map(x=>x.n).join(",")} (${S.vers[S.cur].id}) ${p.map(x=>x.t).join(" ")}`);toast(t("Copied"))}
function bar(){const a=$("#act");a.hidden=S.tab!=="read"||!S.sel.size;if(a.hidden)return;
 const one=S.sel.size===1?picked()[0]:null,k=one&&vkey(one.n),on=!!one&&Voice.recording()&&S.recKey===k;
 a.replaceChildren(h("span",{},`${S.sel.size} ${t("selected")}`),h("button",{onclick:()=>listen(picked().map(x=>({key:vkey(x.n),text:x.t})))},t("Listen")),...[0,1,2,3].map(i=>h("button",{class:"dot d"+i,"aria-label":t("Highlight")+" "+(i+1),onclick:()=>mark(i)})),h("button",{onclick:()=>mark(null)},t("Clear")),h("button",{onclick:queue},t("Animate")),h("button",{onclick:copy},t("Copy")),
  one?h("button",{onclick:()=>toggleRec(k)},on?"\u25cf "+t("Stop"):"\ud83c\udf99 "+t("Record")):null,
  one&&Voice.has(k)&&!on?h("button",{"aria-label":t("Delete my recording"),onclick:async()=>{await Voice.remove(k);keepScroll()}},"\ud83d\uddd1"):null)}
function setLang(){S.lang=S.lang==="sw"?"en":"sw";ls.set("lang",S.lang);if(S.lang==="sw"){const i=S.vers.findIndex(v=>v.id==="SWA");if(i>=0)S.cur=i}S.sel.clear();render()}
function vbar(){$("#vbar").replaceChildren(...S.vers.map((v,i)=>h("button",{class:"chip"+(i===S.cur?" on":""),title:v.name,onclick:()=>{S.cur=i;render()}},v.id)),S.vers.length>1?h("button",{class:"chip"+(S.par?" on":""),onclick:()=>{S.par=!S.par;render()}},t("Parallel")):null,h("button",{class:"chip",title:"Language / Lugha",onclick:setLang},S.lang==="sw"?t("English"):t("Kiswahili")))}
const missing=()=>BibleDL.ids.filter(id=>!S.vers.some(v=>v.id===id));
async function getBibles(e){const b=e.currentTarget;b.disabled=true;
 const keep=S.vers[S.cur]&&S.vers[S.cur].id;
 const r=await BibleDL.download(p=>{b.textContent=`${t("Downloading")} ${p.id} (${p.i}/${p.n})...`});
 if(r.ok.length){S.vers=(await BibleDL.load()).map(norm);const want=S.lang==="sw"?"SWA":keep,i=S.vers.findIndex(v=>v.id===want);S.cur=i>=0?i:0;S.sel.clear()}
 toast(r.failed.length?(r.ok.length?`${t("Got")}: ${r.ok.join(", ")}. ${t("Failed")}: ${r.failed.join(", ")}`:t("Download failed. Check your internet and try again.")):`${t("Downloaded")}: ${r.ok.join(", ")}`);
 render()}
function readView(){const v=S.vers[S.cur],names=BOOKS.filter(b=>v.books[b]);if(!v.books[S.book])S.book=names[0];
 const chs=Object.keys(v.books[S.book]).sort((a,b)=>a-b);if(!chs.includes(S.ch))S.ch=chs[0];
 return h("div",{},missing().length?h("div",{style:"margin:.5rem 0"},h("button",{class:"main",onclick:getBibles},t("Download the Bibles (English + Swahili)")),h("p",{class:"small"},t("Free to use. Needs internet once, then works offline."))):null,
 h("div",{class:"pick"},h("select",{"aria-label":t("Book"),onchange:e=>{S.book=e.target.value;S.ch=null;S.sel.clear();render()}},names.map(n=>h("option",{value:n,selected:n===S.book},BN(n)))),h("select",{"aria-label":t("Chapter"),onchange:e=>{S.ch=e.target.value;S.sel.clear();render()}},chs.map(c=>h("option",{value:c,selected:c===S.ch},c)))),
 h("article",{class:"text"},h("h2",{},`${BN(S.book)} ${S.ch}`),v.books[S.book][S.ch].map(x=>{const c=S.hl[key(x.n)];
  return h("p",{class:"v"+(S.sel.has(x.n)?" sel":"")+(c!=null?" hl"+c:""),onclick:e=>{S.sel.has(x.n)?S.sel.delete(x.n):S.sel.add(x.n);e.currentTarget.classList.toggle("sel");bar()}},h("sup",{},x.n)," ",Voice.has(vkey(x.n))?"\ud83c\udf99 ":null,x.t,
   S.par?S.vers.filter((_,i)=>i!==S.cur).map(o=>{const tt=(o.books[S.book]?.[S.ch]||[]).find(y=>y.n==x.n);return tt&&h("span",{class:"alt"},h("b",{},o.id+" "),tt.t)}):null)}),v.note?h("p",{class:"small"},v.note):null))}
function dailyView(){const d=S.daily;if(!d.length)return h("p",{},t("No daily studies found. Add some to data/daily.json."));
 const i=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5)%d.length,e=d[i],day=(n=>`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`)(new Date());
 const text=(S.vers[S.cur].books[e.book]?.[e.ch]||[]).filter(x=>x.n>=e.from&&x.n<=e.to).map(x=>x.t).join(" ");
 const dk=`d|${S.vers[S.cur].id}|${e.book}|${e.ch}|${e.from}-${e.to}`,rk=`r|${S.lang}|${e.title}`;
 return h("article",{class:"text"},h("h2",{},L(e,"title")),h("p",{class:"ref"},`${BN(e.book)} ${e.ch}:${e.from}-${e.to} (${S.vers[S.cur].id})`),h("blockquote",{},text||t("This passage isn't in the selected version yet.")),text&&h("button",{onclick:()=>listen([{key:dk,text}])},t("Listen")),text&&voiceRow(dk),
  h("h3",{},t("Reflect")),h("p",{},L(e,"note")),h("button",{onclick:()=>listen([{key:rk,text:L(e,"note")+" "+L(e,"question")}])},t("Listen")),voiceRow(rk),h("h3",{},t("Think about it")),h("p",{},L(e,"question")),
  h("button",{class:"main",onclick:()=>{S.done[day]=!S.done[day];ls.set("done",S.done);render()}},S.done[day]?t("Done today"):t("Mark as done")),h("p",{class:"small"},`${t("Days completed")}: ${Object.values(S.done).filter(Boolean).length}`))}
const stars=[[40,30],[120,60],[330,40],[290,90],[70,170],[350,180]].map(([x,y],i)=>`<circle class="tw" style="animation-delay:${i*.3}s" cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join("");
const sheep=(x,y,d)=>`<g class="bob" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y}" rx="26" ry="18" fill="#fff"/><circle cx="${x+24}" cy="${y-4}" r="9" fill="#333"/><rect x="${x-14}" y="${y+14}" width="5" height="13" fill="#333"/><rect x="${x+10}" y="${y+14}" width="5" height="13" fill="#333"/></g>`;
const SC={
light:`<svg viewBox="0 0 400 240"><rect width="400" height="240" fill="#0b1030"/><g class="spin" style="transform-origin:200px 120px"><path d="M200 120L120 0H280zM200 120L400 40V200zM200 120L280 240H120zM200 120L0 200V40z" fill="#ffe27a" opacity=".25"/></g><circle class="pulse" cx="200" cy="120" r="46" fill="#fff3b0"/><circle cx="200" cy="120" r="28" fill="#fff"/>${stars}</svg>`,
shepherd:`<svg viewBox="0 0 400 240"><rect width="400" height="240" fill="#8fd3ff"/><circle class="pulse" cx="330" cy="50" r="28" fill="#ffd93b"/><g class="drift"><ellipse cx="60" cy="50" rx="40" ry="14" fill="#fff"/><ellipse cx="90" cy="42" rx="26" ry="12" fill="#fff"/></g><ellipse cx="120" cy="260" rx="260" ry="110" fill="#5cb85c"/><ellipse cx="330" cy="270" rx="220" ry="90" fill="#4aa54a"/>${sheep(110,170,0)}${sheep(210,190,.4)}${sheep(300,165,.8)}</svg>`,
heart:`<svg viewBox="0 0 400 240"><rect width="400" height="240" fill="#ffd6e7"/><path class="pulse" d="M200 215C80 140 90 40 150 40c25 0 42 14 50 32 8-18 25-32 50-32 60 0 70 100-50 175z" fill="#ff4d7d"/><g font-size="26" fill="#ff4d7d"><text class="rise" x="40" y="220">♥</text><text class="rise" style="animation-delay:1.3s" x="340" y="220">♥</text><text class="rise" style="animation-delay:2.4s" x="90" y="230">♥</text><text class="rise" style="animation-delay:.7s" x="300" y="230">♥</text></g></svg>`};
function kidsView(){
 if(S.play){const l=S.play,lk=`l|${S.lang}|${l.id}`,txt=`${L(l,"say")} ${lessonVerse(l)}`,ws=[...txt.matchAll(/\S+/g)].map(m=>{const s=h("span",{class:"w"},m[0]+" ");s.i=m.index;return s}),on=ci=>ws.forEach(s=>s.classList.toggle("on",s.i<=ci&&ci<s.i+s.textContent.length-1));
  const stage=h("div",{class:"stage"});if(l.video){stage.append(h("video",{src:l.video,controls:true,playsinline:true}))}else stage.innerHTML=typeof l.scene==="object"?KIT.render(l.scene):SC[l.scene]||SC.light;
  return h("div",{},h("button",{onclick:()=>{S.play=null;render()}},t("Back")),h("h2",{},L(l,"ref")),stage,h("p",{class:"cap"},ws),h("button",{class:"main",onclick:()=>{if(Voice.has(lk)){stop();Voice.play(lk)}else speak(txt,{kid:true,word:on,end:()=>on(-1)})}},t("Read to me")),voiceRow(lk))}
 return h("section",{},h("h2",{},t("Sunday school")),h("div",{class:"grid"},S.lessons.map(l=>h("button",{class:"lesson",onclick:()=>{S.play=l;render()}},h("b",{},l.emoji),L(l,"ref")))),
  h("h3",{},`${t("Verses waiting to be animated")} (${S.q.length})`),h("p",{class:"small"},t("Pick verses in Read and tap Animate. Export the list, make the cartoons online, then add them to data/kids/lessons.json.")),
  S.q.length?h("div",{},S.q.map(q=>h("p",{class:"small"},`${q.ref} (${q.version})`)),h("button",{class:"main",onclick:()=>{const a=h("a",{href:URL.createObjectURL(new Blob([JSON.stringify(S.q,null,2)],{type:"application/json"})),download:"animation-queue.json"});a.click()}},t("Export list")),h("button",{onclick:()=>{S.q=[];ls.set("q",[]);render()}},t("Clear list"))):null)}
const NAVL={read:"Read",daily:"Daily",kids:"Kids"};
function render(){stop();document.documentElement.lang=S.lang;const ttl=S.lang==="sw"?"Biblia Takatifu":"Holy Bible";document.title=ttl;$("header h1").textContent=ttl;document.body.className=S.tab;$("#main").replaceChildren(S.tab==="read"?readView():S.tab==="daily"?dailyView():kidsView());vbar();bar();document.querySelectorAll("nav button").forEach(b=>{b.textContent=t(NAVL[b.dataset.t]);b.classList.toggle("on",b.dataset.t===S.tab)})}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;S.play=null;render();scrollTo(0,0)});
(async()=>{const j=async u=>{try{return await(await fetch(u)).json()}catch{return null}};
 await Voice.init();
 const man=await j("data/versions.json");for(const f of(man&&man.files&&man.files.length?man.files:[])){const r=await j(f);if(r)S.vers.push(norm(r))}
 if(!S.vers.length)(await BibleDL.load()).forEach(r=>S.vers.push(norm(r)));
 if(!S.vers.length){const r=await j("data/sample.json");if(r)S.vers.push(norm(r))}
 if(S.lang==="sw"){const i=S.vers.findIndex(v=>v.id==="SWA");if(i>=0)S.cur=i}
 S.daily=await j("data/daily.json")||[];S.lessons=await j("data/kids/lessons.json")||[];render();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js")})();
