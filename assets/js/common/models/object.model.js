/**
 * Created by jinyong on 16-10-12.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('IpPool', IpPool)
        .factory('SecurityArea', SecurityArea)
        .factory('DeviceAsset', DeviceAsset)
        .factory('ServicePredefine', ServicePredefine)
        .factory('ServiceCustomize', ServiceCustomize)
        .factory('ApplyPredefine', ApplyPredefine)
        .factory('ApplyCustomize', ApplyCustomize)
        .factory('ObjectSchedule', ObjectSchedule);

    ///////////////////////////
    function IpPool($http, URI, encodeURL) {
        var objecturl = URI + '/objects/addresspool/';

        var service = {
            getAll: getAll,
            getCount: getCount,
            getTypes: getTypes,
            getInterfaces: getInterfaces,
            addNewIpPool: addNewIpPool,
            updateIpPool: updateIpPool,
            deleteIpPool: deleteIpPool,
            switchIpPool: switchIpPool
        };

        return service;

        //////////
        function getAll(params) {
            var link = objecturl + 'all';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            var link = objecturl + 'all/count';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getTypes() {
            return $http.get(objecturl + 'types').then(function (data) {
                return data.data;
            });
        }

        function getInterfaces() {
            var url = URI + '/netinterfaces';
            var payload = {};
            payload.$filter = "interfaceType eq 'ETH'";
            payload.$filter += " or interfaceType eq 'BRI'";
            return $http.get(url+'/queryInterfacesByConditions',{
                params: encodeURL(payload)
            }).then(function (data) {
                return data.data;
            });
        }

        function addNewIpPool(data, callback) {
            return $http({
                    url: objecturl + 'ippool',
                    method: 'POST',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function updateIpPool(data, callback) {
            return $http({
                    url: objecturl + 'ippool',
                    method: 'PUT',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function deleteIpPool(data, callback) {
            return $http({
                    url: objecturl + 'ippools',
                    method: 'DELETE',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function switchIpPool(ipPoolName, action, callback){
            action = action?'1':'0';
            return $http({
                url: objecturl + '' + ipPoolName + '/enable/' + action,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }
    }

    ///////////////////////////
    function SecurityArea($http, URI, encodeURL, interfaceModel) {
        var securityurl = URI + '/objects/securityarea/';

        var service = {
            getAll: getAll,
            getCount: getCount,
            getInterfaces: getInterfaces,
            addNewSecurityArea: addNewSecurityArea,
            updateSecurityArea: updateSecurityArea,
            deleteSecurityArea: deleteSecurityArea,
            switchSecurityArea: switchSecurityArea,
            getAllSecurityAreaAndAssets: getAllSecurityAreaAndAssets
        };

        return service;

        //////////
        function getAll(params) {
           var link = securityurl + 'all';
           return $http.get(link, {
               params: encodeURL(params)
           }).then(function (data) {
               return data.data;
           });
        }

        function getCount(params) {
           var link = securityurl + 'all/count';
           return $http.get(link, {
               params: encodeURL(params)
           }).then(function (data) {
               return data.data;
           });
        }

        function getInterfaces() {
            //获取接口基本，状态信息以及安全区域所属状况。
            return interfaceModel.getNetInterfaceDatas();
        }

        function addNewSecurityArea(data, callback) {
            return $http({
                    url: URI + '/objects/securityarea',
                    method: 'POST',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function updateSecurityArea(data, callback) {
            return $http({
                    url: securityurl,
                    method: 'PUT',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function deleteSecurityArea(data,callback) {
            $http({
                    url: URI + '/objects/securityarea/',
                    method: 'DELETE',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function switchSecurityArea(securityAreaId, name, action, callback) {
            action = action ? '1' : '0';
            return $http({
                url: securityurl + '' + securityAreaId + '/' + '' + name + '/enable/' + action,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function getAllSecurityAreaAndAssets(params) {
            var link = securityurl + 'asset/all';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });

        }
    }

    ///////////////////////////
    function DeviceAsset($http, URI, encodeURL) {
        var deviceurl = URI + '/objects/asset/';

        var service = {
            getAll: getAll,
            getCount: getCount,
            getTypes: getTypes,
            getFactories: getFactories,
            getModels: getModels,
//            getAddressPoolNames: getAddressPoolNames,
            getSecurityAreaNames: getSecurityAreaNames,
            quickTransferTo: quickTransferTo,
            addNewDeviceAsset: addNewDeviceAsset,
            updateDeviceAsset: updateDeviceAsset,
            deleteDeviceAsset: deleteDeviceAsset,
            switchDeviceAsset: switchDeviceAsset,
            getAllIpmacInfo: getAllIpmacInfo,
            createIPMACBinding: createIPMACBinding,
            deleteIPMACBinding: deleteIPMACBinding,
            checkReferencedByIpMac:checkReferencedByIpMac
        };

        return service;

        //////////
        function getAll(params) {
           var link = deviceurl + 'all';
           return $http.get(link, {
               params: encodeURL(params)
           }).then(function (data) {
               return data.data;
           });
        }

        function getCount(params) {
            var link = deviceurl + 'all/count';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getTypes() {
            return $http.get(URI + '/objects/model/type').then(function (data) {
                return data.data;
            });
        }

        function getFactories(type) {
            var payload = {
                modelname: type
            };
            return $http.get(URI + '/objects/model/make', {
                params: encodeURL(payload)
            }).then(function (data) {
                return data.data;
            });
        }

        function getModels(type, factory) {
            var payload = {
                modelname: type,
                makename: factory
            };
            return $http.get(URI + '/objects/model/name', {
                params: encodeURL(payload)
            }).then(function (data) {
                return data.data;
            });
        }

//        function getAddressPoolNames() {
//            return $http.get(URI + '/objects/addresspool/name').then(function (data) {
//                return data.data;
//            });
//        }

        function getSecurityAreaNames() {
            return $http.get(URI + '/objects/securityarea/all/names').then(function (data) {
                return data.data;
            });
        }

        function addNewDeviceAsset(data, callback) {
            return $http({
                    url: URI + '/objects/asset',
                    method: 'POST',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function updateDeviceAsset(data, callback) {
            return $http({
                    url: URI + '/objects/asset',
                    method: 'PUT',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function deleteDeviceAsset(data, callback) {
            $http({
                    url: URI + '/objects/asset',
                    method: 'DELETE',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function switchDeviceAsset(assetId,name, action, callback){
            action = action?'1':'0';
            return $http({
                    url: deviceurl +''+assetId+''+ '/' + name + '/enable/' + action,
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function quickTransferTo(data) {
            var payload={
                assetNames: data.assetNames,
                secNames: data.secNames,
                assetIds:data.assetIds,
                securityAreaName: data.securityarea
            };
            return $http.put(deviceurl + 'quickTransfer', null, {
                params: encodeURL(payload)
            }).then(function (data) {
                return data.data;
            });
        }

        function getAllIpmacInfo(params) {
            var link = deviceurl + 'ipmac/set';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                if (data.data) {
                    for (var i = 0; i < data.data.length; i++) {
                        data.data[i]._ipmacBoolean = data.data[i]._ipmac === 1;
                    }
                }
                return data.data;
            });
        }

        function createIPMACBinding(param) {
            return $http.post(deviceurl + 'ipmac/set', param);
        }

        function deleteIPMACBinding() {
            return $http.post(deviceurl + 'ipmac/delete');
        }
        function checkReferencedByIpMac(assetId){
            return $http.get(deviceurl + 'referenced/assetId/'+assetId).then(function(data){
                return data.data;
            });
        }
    }

    ///////////////////////////
    function ServicePredefine($http, URI, encodeURL) {
        var predefineurl = URI + '/objects/predefineserver/';

        var service = {
            getAll: getAll,
            getCount: getCount
        };

        return service;

        //////////
        function getAll(params) {
            var link = predefineurl + 'all';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            var link = predefineurl + 'all/count';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }
    }

    ///////////////////////////
    function ServiceCustomize($http, URI, encodeURL) {
        var customizeurl = URI + '/objects/server/';

        var service = {
            getAll: getAll,
            getCount: getCount,
            addNewService: addNewService,
            updateService: updateService,
            deleteService: deleteService
        };

        return service;

        //////////
        function getAll(params) {
            var link = customizeurl + 'all';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            var link = customizeurl + 'all/count';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function addNewService(data, callback) {
            return $http({
                    url: URI + '/objects/server',
                    method: 'POST',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function updateService(data, callback) {
            return $http({
                    url: URI + '/objects/server',
                    method: 'PUT',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function deleteService(data, callback) {
            $http({
                    url: URI + '/objects/server',
                    method: 'DELETE',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }
    }

    ///////////////////////////
    function ApplyPredefine($http, URI, encodeURL) {
        var predefineurl = URI + '/objects/predefineapp/';

        var service = {
            getAll: getAll,
            getCount: getCount
        };

        return service;

        //////////
        function getAll(params) {
            var link = predefineurl + 'all';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            var link = predefineurl + 'all/count';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }
    }

    ///////////////////////////
    function ApplyCustomize($http, URI, encodeURL) {
        var customizeurl = URI + '/objects/app/';

        var service = {
            getAll: getAll,
            getCount: getCount,
            getProtocols: getProtocols,
            getPredefineApps: getPredefineApps,
            addNewApply: addNewApply,
            updateApply: updateApply,
            deleteApply: deleteApply
        };

        return service;

        //////////
        function getAll(params) {
            var link = customizeurl + 'all';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            var link = customizeurl + 'all/count';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getProtocols() {
            return $http.get(customizeurl + 'types').then(function (data) {
                return data.data;
            });
        }

        function getPredefineApps() {
            return $http.get(URI + '/objects/predefineapp/names').then(function (data) {
                return data.data;
            });
        }

        function addNewApply(data, callback) {
            return $http({
                    url: URI + '/objects/app',
                    method: 'POST',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function updateApply(data, callback) {
            return $http({
                    url: URI + '/objects/app',
                    method: 'PUT',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function deleteApply(data, callback) {
            $http({
                    url: URI + '/objects/app',
                    method: 'DELETE',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }
    }

    ///////////////////////////
    function ObjectSchedule($http, URI, encodeURL) {
        var scheduleurl = URI + '/objects/time/';

        var service = {
            getAll: getAll,
            getCount: getCount,
            addSingleSchedule: addSingleSchedule,
            addLoopSchedule: addLoopSchedule,
            updateSchedule: updateSchedule,
            deleteSchedule: deleteSchedule
        };

        return service;

        //////////
        function getAll(params) {
            var link = scheduleurl + 'all';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            var link = scheduleurl + 'all/count';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function addSingleSchedule(data, callback) {
            if(angular.isArray(data)){
                data.forEach(function(item){
                    item.type = 'ONCE';
                });
            }else{
                data.type = 'ONCE';
            }
            return $http({
                    url: URI + '/objects/time',
                    method: 'POST',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function addLoopSchedule(data, callback) {
            if(angular.isArray(data)){
                data.forEach(function(item){
                    item.type = 'LOOP';
                });
            }else{
                data.type = 'LOOP';
            }
            return $http({
                    url: URI + '/objects/time',
                    method: 'POST',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function updateSchedule(data, callback) {
            return $http({
                    url: URI + '/objects/time',
                    method: 'PUT',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function deleteSchedule(data, callback) {
            $http({
                    url: URI + '/objects/time',
                    method: 'DELETE',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }
    }
})();
