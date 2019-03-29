/**
 * Global Event Directive
 *
 * Description
 */
(function () {
    'use strict';
    angular
        .module('southWest.directives')
        .directive('globalEvents', globalEvents);

    function globalEvents(SystemUser, debounce, $timeout, auth) {
        var globalEventsObj = {
            restrict: 'A',
            link: link
        };
        return globalEventsObj;

        function link(scope, el) {
            var isTriggered = false;
            el.bind('click', function () {
                //  If user has not logged in yet, skip updating user token
                if (!isTriggered && auth.getUserName().length > 0) {
                    SystemUser.userToken();
                    isTriggered = true;
                    //  Do not update token more than once every 5 seconds.
                    $timeout(function () {
                        isTriggered = false;
                    }, 5000);
                }
            });
        }
    }
})();
