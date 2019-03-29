/*****************************
 *    UCD Control Service
 *****************************/
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('UCD', uriCrossDomain);

    function uriCrossDomain($q, $rootScope) {
        //// MOCKUP DATA:
        // $rootScope.ucdInfo = [{
        //     "ip" : "10.0.10.151",
        //     "topoId": "f43e4a83-9b4d-47de-9325-9e7a39eef573"
        // }];

        var service = {
            setDomain: setDomain,
            getDomain: getDomain,
            getUrl: getUrl,
            getAllDomains: getAllDomains,
            addDomain: addDomain,
            removeDomain: removeDomain
        };
        return service;

        function setDomain(ip, topoId) {
            var domain = $rootScope.ucdInfo.filter(function (a) {
                a.ip === ip;
            })[0];
            if (domain) {
                domain.topoId = topoId;
            } else {
                console.log("IP not found!");
            }
        }

        function getDomain(ip, topologyId) {
            var domain;
            if (ip) {
                if ($rootScope.ucdInfo) {
                    domain = $rootScope.ucdInfo.filter(function (a) {
                        return a.ip === ip;
                    })[0];
                    if (domain) {
                        return domain;
                    } else {
                        console.log("Warning: Invalid IP");
                    }
                } else {
                    return {topoId: null};
                }
            } else {
                return {
                    "topoId": topologyId
                };
            }
        }

        function getUrl(ip, head, port) {
            if ($rootScope.isProduction) {
                return ip ? ((head ? head : 'https://') + ip) : "";
            } else {
                return ip ? ((head ? head : 'http://') + ip + (port ? port : ':3000')) : "";
            }
        }

        function getAllDomains() {
            return $rootScope.ucdInfo;
        }

        function addDomain(data) {
            var dulp = $rootScope.ucdInfo.filter(function (a) {
                a.ip === data.ip;
            })[0];
            if (dulp) {
                dulp.topoId = data.topoId;
            } else {
                $rootScope.ucdInfo.push(data);
            }
        }

        function removeDomain(ip) {
            for (var i = 0; i < $rootScope.ucdInfo.length; i++) {
                if ($rootScope.ucdInfo[i].ip === ip) {
                    $rootScope.ucdInfo.splice(i, 1);
                    return true;
                }
            }
            console.log("No match found for removeDomain");
            return false;
        }
    }
})();

