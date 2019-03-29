/**
 * Monitor Audit Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.dpidevicedata')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('audit.dpidevice_data', {
            url: '/dpidevicedata',
            controller: 'DPIDeviceDataCtrl as dpidevicedata',
            templateUrl: 'templates/audit/dpidevicedata/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        }).state('audit.dpidevice_data.detail', {
            parent: 'audit',
            url: '/dpidevicedata/deviceid/:deviceID/boxid/:boxId/dpiIp/:dpiIp/',
            controller: 'DPIDeviceTrafficDataCtrl as dpidevicetrafficdata',
            templateUrl: 'templates/audit/dpidevicedata/details.html',
            resolve: {
                device: function ($stateParams, $q, Device, Topology, topologyId, domain, $filter) {
                    if (!topologyId.id) {
                        return domain.getDomain().then(function () {
                            return getDevice();
                        });
                    } else {
                        return getDevice();
                    }

                    function getDevice() {
                        return Device.get($stateParams.deviceID)
                            .then(function (data) {
                                var splitName = data._model_name ? data._model_name.split(' /') : [];
                                if (splitName[0] === "数控审计保护平台") {
                                    data._model_name = $filter('resFilter')(splitName[0], 'slideAuditTitle') + ' /' + splitName[1];
                                }
                                return data;
                            }, function () {
                                return false;
                            });
                    }
                },
                boxID: function ($stateParams) {
                    return $stateParams.boxId;
                },
                dpiIp: function ($stateParams) {
                    return $stateParams.dpiIp;
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        });
    }
})();
