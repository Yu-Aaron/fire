(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('ServiceWorker', function ($q) {
            var serviceWorkerController;
            var listeners = {};
            function startHeartbeat(controller) {
                controller && controller.postMessage({
                    type: 'heartbeat'
                });
                setInterval(function () {
                    controller && controller.postMessage({
                        type: 'heartbeat'
                    });
                }, 3000);
            }

            function getController() {
                return $q(function (resolve) {
                    serviceWorkerController = serviceWorkerController || navigator.serviceWorker.controller;
                    if(serviceWorkerController) {
                        resolve(serviceWorkerController);
                    } else {
                        setTimeout(function () {
                            resolve(getController());
                        }, 1000);
                    }
                });
            }

            function init() {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(function () {
                        getController().then(function (controller) {
                            startHeartbeat(controller);
                        });
                    });
                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                        // Registration was successful
                        if(navigator.serviceWorker.controller) {
                            serviceWorkerController = navigator.serviceWorker.controller;
                        } else {
                            serviceWorkerController = registration.active;
                        }
                        console.log('ServiceWorker registration successful with scope: ',    registration.scope);
                    }).catch(function(err) {
                        // registration failed :(
                        console.log('ServiceWorker registration failed: ', err);
                    });
                    navigator.serviceWorker.addEventListener('message', function handler (event) {
                        listeners[event.data.key] && listeners[event.data.key].call(null, event);
                    });
                }
            }

            function postMessage(message) {
                getController().then(function (controller) {
                    controller && controller.postMessage(message);
                });
            }

            function registerHandler(event, callback) {
                if(typeof callback === 'function') {
                    listeners[event] = callback;
                }
            }

            function broadcast(message) {
                if (typeof message === 'string') {
                    message = {
                        key: message
                    };
                }
                postMessage({
                    type: 'broadcast',
                    message: message
                });
            }

            return {
                init: init,
                postMessage: postMessage,
                getController: getController,
                broadcast: broadcast,
                on: registerHandler
            };
        });
})();
