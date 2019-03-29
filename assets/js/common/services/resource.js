/**
 * Created by Morgan on 15-02-26.
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('resource', resource);

    function resource($rootScope, $http) {

        var service = {
            getResource: getResource
        };
        return service;


        function getResource(version) {
            return $http.get('js/resource' + version + '.json').then(function (data) {
                $rootScope.resource = data.data;
            });
        }
    }

})();
