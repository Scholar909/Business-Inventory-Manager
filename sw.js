const CACHE_NAME = "app-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/creditorslist.html",
    "/help.html",
    "/jottings.html",
    "/paidcreditorslist.html",
    "/productlist.html",
    "/style.css",
    "/creditors.js",
    "/indexDB.js",
    "/jottings.js",
    "/paid.js",
    "/products.js",
    "/IMG-20250316-WA0171.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
    }));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(caches.match(event.request).then((response) => {
        return response || fetch(event.request);
    }));
});

self.addEventListener("activate", (event) => {
    event.waitUntil(caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cache) => {
            if (cache !== CACHE_NAME){
                return caches.delete(cache);
            }
        }));
    }));
});