const KIT=(()=>{
const C=a=>a?` class="${a}"`:"",T=o=>`translate(${o.x} ${o.y}) scale(${o.s||1})`;
const P={
person:o=>`<g transform="${T(o)}"><g${C(o.anim)}><path d="M-22 0L-14-46H14L22 0Z" fill="${o.robe||"#e76f51"}"/><circle cy="-62" r="16" fill="${o.skin||"#f1c27d"}"/><path d="M-16-64a16 16 0 0 1 32 0c-8-8-24-8-32 0z" fill="${o.hair||"#4a2c17"}"/><circle cx="-6" cy="-60" r="2" fill="#222"/><circle cx="6" cy="-60" r="2" fill="#222"/><path d="M-5-53q5 5 10 0" stroke="#222" fill="none" stroke-width="1.6"/><circle cx="-11" cy="-55" r="3" fill="#f4a09a" opacity=".6"/><circle cx="11" cy="-55" r="3" fill="#f4a09a" opacity=".6"/></g></g>`,
sheep:o=>`<g transform="${T(o)}"><g${C(o.anim)}><rect x="-14" y="-12" width="5" height="12" fill="#444"/><rect x="9" y="-12" width="5" height="12" fill="#444"/><ellipse cy="-22" rx="24" ry="16" fill="#fff" stroke="#e3e8ef"/><circle cx="22" cy="-26" r="9" fill="#444"/><circle cx="25" cy="-28" r="1.6" fill="#fff"/></g></g>`,
lamb:o=>P.sheep({...o,s:(o.s||1)*.6}),
lion:o=>`<g transform="${T(o)}"><g${C(o.anim)}><ellipse cx="-22" cy="-16" rx="26" ry="14" fill="#e0a040"/><circle cy="-34" r="24" fill="#b86b25"/><circle cy="-34" r="15" fill="#f4c070"/><circle cx="-5" cy="-37" r="2" fill="#222"/><circle cx="5" cy="-37" r="2" fill="#222"/><ellipse cy="-31" rx="4" ry="3" fill="#7a4a1a"/><path d="M-5-26q5 4 10 0" stroke="#222" fill="none" stroke-width="1.5"/></g></g>`,
dove:o=>`<g transform="${T(o)}"><g${C(o.anim)}><ellipse rx="16" ry="8" fill="#fff" stroke="#cfd8e3"/><path d="M-4-2Q-14-22 6-18Q4-8 4-2z" fill="#eef3fa" stroke="#cfd8e3"/><circle cx="15" cy="-5" r="6" fill="#fff" stroke="#cfd8e3"/><path d="M20-5l6 2-6 2z" fill="#f4a63c"/><circle cx="16" cy="-6" r="1.3" fill="#222"/></g></g>`,
tree:o=>`<g transform="${T(o)}"><g${C(o.anim)}><rect x="-6" y="-40" width="12" height="40" fill="#8b5a2b"/><circle cy="-56" r="26" fill="#4fae5a"/><circle cx="-18" cy="-44" r="16" fill="#5cc068"/><circle cx="18" cy="-44" r="16" fill="#5cc068"/></g></g>`,
sun:o=>`<g transform="${T(o)}"><g class="${o.anim||"pulse"}"><circle r="22" fill="#ffd93b"/><circle cx="-7" cy="-3" r="2" fill="#a86a00"/><circle cx="7" cy="-3" r="2" fill="#a86a00"/><path d="M-6 5q6 5 12 0" stroke="#a86a00" fill="none" stroke-width="2"/></g></g>`,
cloud:o=>`<g transform="${T(o)}"><g${C(o.anim||"drift")}><ellipse rx="34" ry="12" fill="#fff"/><ellipse cx="14" cy="-8" rx="20" ry="12" fill="#fff"/><ellipse cx="-14" cy="-6" rx="16" ry="10" fill="#fff"/></g></g>`,
star:o=>`<g transform="${T(o)}"><g class="${o.anim||"tw"}"><path d="M0-14L4-4 15-4 6 3 9 14 0 8-9 14-6 3-15-4-4-4z" fill="#ffe27a"/></g></g>`,
heart:o=>`<g transform="${T(o)}"><g class="${o.anim||"pulse"}"><path d="M0 14C-22-2-18-20-8-20c5 0 8 3 8 6 0-3 3-6 8-6 10 0 14 18-8 34z" fill="#ff4d7d"/></g></g>`,
water:o=>`<g transform="${T(o)}"><g${C(o.anim||"drift")}><path d="M-100 0q25-10 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0V70H-100z" fill="#4aa8e8"/></g></g>`,
hill:o=>`<g transform="${T(o)}"><ellipse rx="180" ry="60" fill="${o.robe||"#5cb85c"}"/></g>`};
const BG={day:"#8fd3ff",night:"#0b1030",sunset:"#ffb27a"};
return{render:s=>`<svg viewBox="0 0 400 240"><rect width="400" height="240" fill="${BG[s.bg]||BG.day}"/>${(s.items||[]).filter(i=>P[i.t]).map(i=>P[i.t](i)).join("")}</svg>`}})();
