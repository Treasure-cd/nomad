const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v1");
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
   event.waitUntil(
    addResourcesToCache([
      "/icons/icon-512.png"
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("Found in cache!", event.request.url);
        return cachedResponse;
      }
      
      return fetch(event.request); 
    })
  );
});