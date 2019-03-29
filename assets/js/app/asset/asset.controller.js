/**
 * Asset Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset')
        .controller('AssetCtrl', AssetCtrl);

    function AssetCtrl($state, localStorage, uiCtrl, $rootScope, $modal, $scope, $log, leftNavCustomMenu) {
        var vm = this;
        console.log($rootScope.MW_SETTING);
        if ($rootScope.MW_SETTING === 'allInOne' || $rootScope.MW_SETTING === 'remote') {
            $state.go('asset.ucddevice');
        }
        vm.expanded = localStorage.getItem('asset:navbar:expanded') === 'true' ? true : false;

        vm.leftNavItemEnabled = leftNavCustomMenu.leftNavItemEnabled;

        vm.toggleExpand = function () {
            vm.expanded = !vm.expanded;
            localStorage.setItem('asset:navbar:expanded', vm.expanded);
        };

        vm.isActive = function (state) {
            return $state.current.name.indexOf(state) > -1;
        };

        vm.uiEnable = function (target, lv) {
            return uiCtrl.isShow(target, lv);
        };

        vm.deleteOneDevice = function (dvc) {
            console.log(dvc.deviceId);
            var modalInstance = $modal.open({
                templateUrl: 'templates/asset/deleteDevice.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    device: function () {
                        return dvc;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, device, Device, $q, Topology) {

                $scope.device = device;
                $scope.ok = function () {
                    $q.all([
                        Topology.getNodes($scope.device.topologyId),
                        Topology.getLinks($scope.device.topologyId)
                    ]).then(function (d) {
                        var nodes = d[0].data;
                        var nodeMap = {}; // for quicker access
                        var links = d[1].data;
                        var deletables = [];
                        //create a nodemap of all nodes registered to a device.
                        for (var n = 0; n < nodes.length; n++) {
                            if (nodes[n].deviceId === $scope.device.deviceId) {
                                nodeMap[nodes[n].id] = n;
                            }
                        }
                        // loop through topology links and find deletable links
                        for (var l = 0; l < links.length; l++) {
                            if (nodeMap[links[l].nodeID] !== undefined || nodeMap[links[l].destinationNodeID] !== undefined) {
                                deletables.push({id: links[l].id});
                            }
                        }
                        Topology.deleteLink(deletables, $scope.device.topologyId).then(function () {
                            Device.deleteOneDevice(device.deviceId).then(function () {
                                $modalInstance.close();
                                if ($scope.device.category === "SECURITY_DEVICE") {
                                    $state.go('asset.securitydevice');
                                } else if ($scope.device.category === "FACTORY_DEVICE") {
                                    $state.go('asset.factorydevice');
                                } else if ($scope.device.category === "NETWORK_DEVICE") {
                                    $state.go('asset.networkdevice');
                                }
                            });
                        });
                    });
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        };
    }
})();
