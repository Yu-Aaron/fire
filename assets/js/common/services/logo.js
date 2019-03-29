/**
 * Created by Morgan on 15-02-26.
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('logo', logo);

    function logo($rootScope, $http) {

        var service = {
            getLogo: getLogo
        };
        return service;


        function getLogo() {
            return $http.get('js/logo.json').then(function (data) {
                $rootScope.logo = data.data;
            });
        }
    }

})();
