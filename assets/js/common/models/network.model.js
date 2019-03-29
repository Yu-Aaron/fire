/**
 * Audit Model
 *
 * Description
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory("interfaceModel", interfaceModel)
        .factory("staticRouterModel", staticRouterModel);

    function interfaceModel($http, URI, encodeURL, $q) {
        var url = URI + '/netinterfaces';

        var service = {
            getNetInterfaceDatas: getNetInterfaceDatas,
            getNetInterfaceDataCounts: getNetInterfaceDataCounts,
            getInterfaceNames: getInterfaceNames,
            addNetInterfaceData: addNetInterfaceData,
            editNetInterfaceData: editNetInterfaceData,
            checkBeforeDelete: checkBeforeDelete,
            deleteNetInterfaceData: deleteNetInterfaceData,
            getInterfaceListByBri: getInterfaceListByBri,
            isIpRangeDuplicate: isIpRangeDuplicate
        };
        return service;

        function getNetInterfaceDatas() {
            return $http.get(url + '/getInterfaces').then(function (data) {
                return data.data;
            });
        }

        function getNetInterfaceDataCounts() {
            return $q.resolve(0);
        }

        function getInterfaceNames(params) {
            return $http.get(url + '/queryInterfacesByConditions', {
                params: encodeURL(params)
            }).then(function (data) {
                //return data.data;
                var allData = [];
                if (data.data) {
                    angular.forEach(data.data, function (name) {
                        if (name !== 'agl0' && name !== 'ha') {
                            allData.push(name);
                        }
                    });
                }
                return allData;
            });
        }

        function addNetInterfaceData(interfaceData) {
            return $http.post(url + '/addinterface', interfaceData);
        }

        function editNetInterfaceData(interfaceData) {
            return $http.post(url + '/updateinterface', interfaceData);
        }

        function checkBeforeDelete (interfaceData) {
            return $http.post(url + '/checkBeforeDelete', interfaceData);
        }

        function deleteNetInterfaceData(interfaceData) {
            return $http.post(url + '/deleteinterface', interfaceData);
        }

        function isIpRangeDuplicate(interfaceData){
            return $http.post(url + '/isIpRangeDuplicate/',interfaceData);
        }

        function getInterfaceListByBri(briName) {
            var fullUrl = url + "/getInterfacesByBri";
            if (briName) {
                fullUrl = fullUrl + "/" + briName;
            }
            return $http.get(fullUrl).then(function (data) {
                var allData = [];
                if (data.data) {
                    var rowData = [];
                    angular.forEach(data.data, function (value, key) {
                        if (key !== 'agl0' && key !== 'ha') {
                            if (rowData.length < 4) {
                                rowData.push({"name": key, "used": value});
                            } else {
                                allData.push(rowData);
                                rowData = [];
                                rowData.push({"name": key, "used": value});
                            }
                        }
                    });
                    allData.push(rowData);
                }
                return allData;
            });
        }
    }

    function staticRouterModel($http, URI, encodeURL) {
        var url = URI + '/netinterfaces';
        var service = {
            getStaticRouterDatas: getStaticRouterDatas,
            getStaticRouterDatasCount: getStaticRouterDatasCount,
            getOutInterfaceNames: getOutInterfaceNames,
            addStaticRouterData: addStaticRouterData,
            editStaticRouterData: editStaticRouterData,
            deleteStaticRouterData: deleteStaticRouterData,
            isIpRangeDuplicate: isIpRangeDuplicate
        };

        return service;


        function getStaticRouterDatas(params) {
            return $http.get(url + '/getIPRoutes', {params: encodeURL(params)}).then(function (data) {
                return data.data;
            });
        }

        function getStaticRouterDatasCount(params) {
            return $http.get(url + '/getIPRouteCount', {params: encodeURL(params)}).then(function (data) {
                return data.data;
            });
        }

        function getOutInterfaceNames(params) {
            return $http.get(url + '/queryInterfacesByConditions', {
                params: encodeURL(params)
            }).then(function (data) {
                var allData = [];
                if (data.data) {
                    angular.forEach(data.data, function (name) {
                        if (name !== 'agl0' && name !== 'ha') {
                            allData.push(name);
                        }
                    });
                }
                var interfaces = allData.reverse();
                interfaces.push('any');
                interfaces.reverse();
                return interfaces;
            });
        }

        function addStaticRouterData(staticRouterData) {
            return $http.post(url + '/addIPRoute', staticRouterData);
        }

        function editStaticRouterData(staticRouterData) {
            return $http.post(url + '/updateIPRoute', staticRouterData);
        }

        function deleteStaticRouterData(routeDatas) {
            return $http.post(url + '/deleteIPRoute', routeDatas);
        }

        function isIpRangeDuplicate(routeDatas){
            return $http.post(url + '/isIpRangeDuplicateByRoute/',routeDatas);
        }
    }

})();
