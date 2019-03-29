/**
 * Asset Security Device Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.securitydevice')
        .directive('securityNewDeviceTable', securityNewDeviceTable)
        .directive('securityDeviceTable', securityDeviceTable);

    function securityNewDeviceTable(Device, $rootScope, $state, Enum, $modal) {
        var deviceNewTableObj = {
            scope: false,
            restrict: 'E',
            templateUrl: '/templates/asset/securitydevice/securityNewDeviceTable.html',
            controller: controller,
            controllerAs: 'newdevice',
            link: function () {
            }
        };

        return deviceNewTableObj;

        //////////
        function controller(deviceTypeService) {
            var vm = this;
            vm.simplifyModelName = deviceTypeService.simplifyModelName;
            vm.table = [];

            vm.addModal = function (device) {
                function addToCurrentTopology(key) {
                    device.isAdding = true;
                    Device.addToCurrentTopology(device.deviceId, key).then(function () {
                        device.isAdding = false;
                        var fullDeviceAccess = Enum.get('Role');
                        if (!fullDeviceAccess[0].defaultRole) {
                            var visibleDevice = Enum.get('deviceAccess');
                            if (!visibleDevice) {
                                visibleDevice = [];
                            }
                            visibleDevice.push(device.deviceId);
                        }
                        $state.reload().then(function () {
                            $rootScope.addAlert({
                                type: 'success',
                                content: '加入当前拓扑成功'
                            });
                        });
                    }, function (data) {
                        device.isAdding = false;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '加入当前拓扑失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                        });
                    });
                }

                function addToCurrentTopologyWithVerification() {
                    $modal.open({
                        templateUrl: 'templates/asset/securitydevice/verification-panel.html',
                        size: 'sm',
                        controller: ModalInstanceCtrl
                    });

                    function ModalInstanceCtrl($scope, $modalInstance) {
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.confirm = function () {
                            addToCurrentTopology($scope.vKey);
                            $modalInstance.close('done');
                        };
                    }
                }

                if ($rootScope.isC05) {
                    addToCurrentTopologyWithVerification();
                } else {
                    addToCurrentTopology('');
                }
            };

            vm.removeNewDevice = function (device) {
                vm.confirmRemove(device);
            };

            vm.confirmRemove = function (device) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/asset/securitydevice/removeNewDeviceModal.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl,
                    resolve: {
                        device: function () {
                            return device;
                        }
                    }
                });

                modalInstance.result.then(function (data) {
                    if (data) {
                        Device.removeNewDevice(device.deviceId).then(function () {
                            for (var i = 0; i < vm.table.length; i++) {
                                if (vm.table[i].deviceId === device.deviceId) {
                                    vm.table.splice(i, 1);
                                    break;
                                }
                            }
                            $state.reload();
                        }, function () {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '删除设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                            });
                        });
                    }
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.device = device;
                    $scope.cancel = function () {
                        $modalInstance.close(false);
                    };
                    $scope.confirm = function () {
                        $modalInstance.close(true);
                    };
                }
            };

            getTableData();

            $rootScope.$on('device', function () {
                getTableData();
            });

            function getTableData() {
                var params = {};
                params['$orderby'] = 'name';
                Device.getNewDevices(params).then(function (data) {
                    vm.table = data;
                });
            }
        }
    }

    function securityDeviceTable($q, Device, Topology, topologyId, Enum, $filter) {
        var deviceTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/asset/securitydevice/securityDeviceTable.html',
            controller: controller,
            controllerAs: 'securitydeviceTable',
            link: link
        };

        return deviceTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            var filter = '(category eq SECURITY_DEVICE)';
            var fullDeviceAccess = Enum.get('Role');
            if (!fullDeviceAccess[0].defaultRole) {
                var visibleDevice = Enum.get('deviceAccess');
                if (visibleDevice.length) {
                    filter += " and (";
                    filter += visibleDevice.map(function (field) {
                        return "contains(deviceId, '" + field + "')";
                    }).join(' or ');
                    filter += ")";
                } else {
                    filter += " and (contains(deviceId, 'null'))";
                }
            }
            ctrl.setConfig({
                name: 'device',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'name';
                }
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getAll(payload).then(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i]._iconName = Device.getIconName(data[i].iconType);
                        var splitName = data[i]._model_name ? data[i]._model_name.split(' /') : [];
                        if (splitName[0] === "数控审计保护平台") {
                            data[i]._model_name = $filter('resFilter')(splitName[0], 'slideAuditTitle') + ' /' + splitName[1];
                        }
                    }
                    var arr = data.map(function (d) {
                        return Topology.getDeviceNodes(d.deviceId);
                    });
                    return arr.length ? $q.all(arr).then(function (nodes) {
                        var set = data.map(function (d, i) {
                            var parray = [];
                            for (var nd = 0; nd < nodes[i][0].ports.length; nd++) {
                                parray.push(+nodes[i][0].ports[nd].substr(1));
                            }
                            var p = parray.sort();
                            nodes[i][0].portRange = 'p' + p[0] + '-p' + p[p.length - 1];
                            data[i].nodes = nodes[i];
                        });
                        return $q.all(set).then(function () {
                            return setNodeConnectionStatus(data);
                        });
                    }) : [];
                });
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getCount(payload, topologyId.id);
            }

            function search(q) {
                return Device.search('SECURITY_DEVICE', q);
            }
        }

        function controller($rootScope, deviceTypeService) {
            var vm = this;
            vm.simplifyModelName = deviceTypeService.simplifyModelName;

            vm.updateNodeProperty = function (node) {
                var param = {'nodeProperty': node.tempNodeProperty};
                node.isedting = false;
                return Device.updateNodeProperty(node.id, param).then(function (data) {
                    $rootScope.addAlert({
                        type: 'success',
                        content: '修改部署属性成功'
                    });
                    node.nodeProperty = data.nodeProperty;
                }, function () {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '修改部署属性失败'
                    });
                });
            };
        }
    }

    function setNodeConnectionStatus(data) {
        for (var i in data) {
            if (i && data[i].nodes) {
                for (var j in data[i].nodes) {
                    if (j && data[i].nodes[j].ports && data[i].nodes[j].type === 'IPS' && data[i].nodes[j].online === 1) {
                        for (var k in data[i].nodes[j].ports) {
                            if (data[i].nodes[j].online !== 1) {
                                break;
                            } else {
                                if (k && data[i].nodes[j].ports[k]) {
                                    for (var l in data[i].devicePorts) {
                                        if (l && data[i].devicePorts[l].portName === data[i].nodes[j].ports[k]) {
                                            if (data[i].devicePorts[l].linkState !== 1) {
                                                data[i].nodes[j].online = data[i].devicePorts[l].linkState;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return data;
    }
})();
