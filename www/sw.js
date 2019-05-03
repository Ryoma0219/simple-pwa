var CACHE_NAME = 'sample-v1';
var urlsToCache = ['/index.html', '/css/style.css'];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async function(cache) {
      skipWaiting();
      console.log(urlsToCache);
      console.log('をキャッシュします');
      cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    (function() {
      caches.keys().then(function(oldCacheKeys) {
        console.log(oldCacheKeys);
        oldCacheKeys
          .filter(function(key) {
            return key !== CACHE_NAME;
          })
          .map(function(key) {
            console.log(key + 'を削除しました');
            return caches.delete(key);
          });
      });
      clients.claim();
    })()
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log(event.request.url + 'はキャッシュがあるので使う');
        return response;
      }
      console.log(event.request.url + 'はキャッシュが無いのでリクエストする');

      var fetchRequest = event.request.clone();
      return fetch(fetchRequest).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        var responseToCache = response.clone();
        console.log(event.request.url + 'は新しくキャッシュに保管する');
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
