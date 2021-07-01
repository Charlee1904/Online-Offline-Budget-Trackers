const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v2";
const FILES_TO_CACHE = [
    '/',
    "index.html",
    "db.js",
    "index.js",
    "styles.css",
    "manifest.webmanifest",
    "service-worker.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0"
];

//install
self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    
    self.skipWaiting();
});

self.addEventListener("activate", function(evt){
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key =>{
                    if(key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removed old cache data", key);
                        return caches.delete(key);
                    }
                })
            )
        })
    )
    self.clients.claim();
});

//fetch 
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if(response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }

                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );

        return;
}
evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );
});
//     evt.respondWith(
// //             fetch(evt.request).catch(function() {
// //               return caches.match(evt.request).then(function(response) {
// //                 if (response) {
// //                   return response;
// //                 } else if (evt.request.headers.get("accept").includes("text/html")) {
// //                   return caches.match("/");
// //                 }
// //               });
// //             })
// //           );
// // });
