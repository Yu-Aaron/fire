(function () {
    'use strict';
    angular
        .module('southWest.directives')
        .directive('errorMsg', errorMsg);

    function errorMsg() {
        var dtableObj = {
            scope: {
                validator: '=',
                obj: '=',
                type: '='
            },
            restrict: 'E',
            templateUrl: '/templates/common/errorMessages.html'
        };
        return dtableObj;
    }

})();
