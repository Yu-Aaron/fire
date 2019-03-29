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

    function domainModel($q, $http, URI, encodeURL, topologyId, $rootScope, localStorage) {
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
            var promise = [];
            var domainInfo = localStorage.getItem('domain_getDomain');
            (!domainInfo) && promise.push($http.get(url));
            return $q.all(promise).then(function (data) {
                if (domainInfo) {
                    return JSON.parse(domainInfo);
                } else {
                    if (data[0].data.length > 0) {
                        if (topologyId.id !== data[0].data[0].domainInfo.currentTopologyId) {
                            topologyId.id = data[0].data[0].domainInfo.currentTopologyId || 0;
                            $rootScope.topologyId = data[0].data[0].domainInfo.currentTopologyId || 0;
                        }
                    } else {
                        topologyId.id = 0;
                    }
                    localStorage.setItem('domain_getDomain', JSON.stringify(data[0].data));
                    return data[0].data;
                }
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
