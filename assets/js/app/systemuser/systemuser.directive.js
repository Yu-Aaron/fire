(function () {
    'use strict';

    angular
        .module('southWest.systemuser')
        .directive('privilegeEdit', privilegeEdit);

    function privilegeEdit() {
        var obj = {
            scope: true,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/systemuser/privilege-edit.html',
            link: link
        };
        return obj;
        function link(scope, element, attr) {
            scope.privilege = attr.privilege;
            scope.type = parseInt(attr.type) || 3;
        }
    }
})();
