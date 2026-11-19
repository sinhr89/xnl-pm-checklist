/* XN-L 설치 체크리스트 · 오프라인 캐시 (버전 bf7d06c70e) */
var CACHE="xnl-inst-bf7d06c70e";
var FILES=["./", "index.html", "app.js", "common.js", "../config.js", "../vendor/html2pdf.bundle.min.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE&&k.indexOf("xnl-inst-")===0}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  var url=new URL(e.request.url);if(url.origin!==location.origin)return;
  /* 새 버전이 있으면 받아 두고, 화면은 캐시로 바로 띄움 */
  e.respondWith(caches.open(CACHE).then(function(c){return c.match(e.request,{ignoreSearch:true}).then(function(hit){
    var net=fetch(e.request).then(function(r){if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(function(){return hit});
    return hit||net;
  })}));
});
