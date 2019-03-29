/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.forumpostdata')
        .controller('ForumPostDataCtrl', ForumPostDataCtrl);

    function ForumPostDataCtrl($rootScope) {
        var vm = this;

        vm.gotoTimeControl = function (menuName) {
            $rootScope.menuName = menuName;
        };
    }
})();
