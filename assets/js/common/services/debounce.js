(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('debounce', debounce);

    function debounce($timeout) {
        return function (func, wait) {
            var switcher = {};
            var isTriggered = {};

            return function f(data) {
                var context = this;
                var args = arguments;

                if (switcher[data.name]) {
                    isTriggered[data.name] = true;
                } else {
                    switcher[data.name] = true;
                    isTriggered[data.name] = false;

                    func.apply(context, args);

                    $timeout(function () {
                        switcher[data.name] = false;
                        if (isTriggered[data.name]) {
                            f.apply(context, args);
                        }
                    }, wait);
                }
            };
        };
    }
})();