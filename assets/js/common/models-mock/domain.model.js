/**
 * Subnet Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('domain', domainModel);

    function domainModel($q, $http, URI, encodeURL, topologyId, $rootScope, MOCK) {
        var url = URI + '/domains/';

        var service = {
            getDomain: getDomain,
            getDomainByKeyword: getDomainByKeyword,
            updateDomain: updateDomain,
            updateUser: updateUser,
            lockUser: lockUser,
            deleteDomain: deleteDomain,
            addDomain: addDomain
        };
        return service;

        function getDomain() {
            return $http.get(MOCK + "domain/getDomain.json").then(function (data) {
                if (data.data.length > 0) {
                    if (topologyId.id !== data.data[0].domainInfo.currentTopologyId) {
                        topologyId.id = data.data[0].domainInfo.currentTopologyId || 0;
                        $rootScope.topologyId = data.data[0].domainInfo.currentTopologyId || 0;
                    }
                } else {
                    topologyId.id = 0;
                }
                return data.data;
            });
        }

        function getDomainByKeyword(keyword) {
            return $http.get(url + "?$filter=(contains(domainName, '" + keyword + "') or contains(domainCode, '" + keyword + "'))").then(function (data) {
                return data.data;
            });
        }

        function updateDomain(info) {
            return $http.put(url, info).then(function (data) {
                return data.data;
            });
        }

        function updateUser(info) {
            return $http.put(URI + '/users/user/info', info).then(function (data) {
                return data.data;
            });
        }

        function lockUser(lock, id) {
            return $http.put(URI + '/users/user/' + lock + '/' + id, {}).then(function (data) {
                return data.data;
            });
        }

        function deleteDomain() {
            //TODO
        }

        function addDomain(info) {
            var req = {
                method: 'POST',
                url: url + 'initdomain/',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: info
            };
            return $http(req).then(function (data) {
                console.log(data);
                return data.data;
            });
        }
    }
})();
