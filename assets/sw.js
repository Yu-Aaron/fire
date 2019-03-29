var timer;
self.addEventListener('message', function (event) {
    switch (event.data.type) {
        case 'heartbeat':
            clearTimeout(timer)
            timer = setTimeout(function () {
                fetch("/api/v2.0/logout", {
                    method: "POST",
                    credentials: 'include'
                }).then(function (res) {
                    console.log('Auto logout by serviceWorker.')
                })
            }, 5000);
            break;
        case 'broadcast':
            self.clients.matchAll().then(all => all.map(client => client.postMessage(event.data.message)));
            break;
    }

});

self.addEventListener("install", function () {
    console.log('Install new version service worker.');
    self.skipWaiting();
});

self.addEventListener("activate", function () {
    console.log('Activate service worker.');
    clients.claim();
});
