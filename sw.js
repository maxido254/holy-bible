const C="onebible-v2";
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","style.css","app.js","scenes.js","manifest.webmanifest","icon.svg","data/sample.json","data/daily.json","data/kids/lessons.json"])));self.skipWaiting()});
self.addEventListener("activate",e=>e.waitUntil(clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res})))});
