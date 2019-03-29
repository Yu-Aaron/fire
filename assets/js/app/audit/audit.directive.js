/**
 * Audit Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit')
        .directive('auditSideNav', auditSideNav);

    function auditSideNav() {
        var auditTableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/audit/auditSideNav.html',
            link: link
        };

        return auditTableObj;

        //////////
        function link() {

        }
    }
})();
