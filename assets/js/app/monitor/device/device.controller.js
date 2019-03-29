/**
 * Monitor Device Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.device')
        .controller('DeviceCtrl', DeviceCtrl)
        .controller('DeviceDetailCtrl', DeviceDetailCtrl)
        .controller('DeviceModelCtrl', DeviceModelCtrl);


    function DeviceCtrl($rootScope, $state, $modal, $q, Device, Topology, topologyId, domain, Enum, uiTree) {
        var vm = this;

        vm.contentEnable = function (target) {
            return uiTree.getContentShow(target);
        };
        vm.defaultTab = vm.contentEnable('PROTECTION_SECURITY_DEVICE') ? 'SECURITY_DEVICE' : vm.contentEnable('PROTECTION_FACTORY_DEVICE') ? 'FACTORY_DEVICE' : vm.contentEnable('PROTECTION_NETWORK_DEVICE') ? 'NETWORK_DEVICE' : 'none';

        if (!topologyId.id) {
            return domain.getDomain().then(function () {
                return getOverview();
            });
        } else {
            return getOverview();
        }

        function getOverview() {
            var all = Device.getCount(null, topologyId.id);

            var filter = '';
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

            var managedSecurityCount = Device.getCount({
                '$filter': 'category eq SECURITY_DEVICE' + filter
            }, topologyId.id);

            var ipsidscount = Device.getIpsidsCount();

            var securityCount = Device.getCount({
                '$filter': 'category eq SECURITY_DEVICE'
            }, topologyId.id);

            var factoryCount = Device.getCount({
                '$filter': 'category eq FACTORY_DEVICE'
            }, topologyId.id);

            var networkCount = Device.getCount({
                '$filter': 'category eq NETWORK_DEVICE'
            }, topologyId.id);

            $q.all([all, managedSecurityCount, ipsidscount, securityCount, factoryCount, networkCount]).then(function (data) {
                vm.overview = {};
                vm.overview.all = data[0];
                vm.overview.managedSecurityCount = data[1];
                vm.overview.ipsidsRate = data[2].ips + ' / ' + data[2].ids;
                vm.overview.securityCount = data[3];
                vm.overview.factoryCount = data[4];
                vm.overview.networkCount = data[5];
            });
        }

        $rootScope.$on('addedToCurrentTopology', function () {
            $state.reload();
        });

        vm.newDevice = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/monitor/device/createNewDevice/new.html',
                controller: ModalInstanceCtrl,
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    categories: function (Device) {
                        return Device.getModels({
                            '$select': 'category',
                            "$limit": 1000000
                        });
                    }
                }
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
    }

    function DeviceDetailCtrl(Device, $rootScope, $scope, $q, allInOneIP, $stateParams, auth, Topology, topologyId, domain, UCD, Incident, deviceTypeService, $filter) {
        var vm = this;
        var device;
        var ucdInfo = UCD.getDomain($stateParams.allInOneIP || $stateParams.ip, topologyId.id);

        var promises = [];
        if (!topologyId.id) {
            return domain.getDomain().then(function () {
                promises.push(getDevice());
            });
        } else {
            promises.push(getDevice());
        }
        function getDevice() {
            console.log(ucdInfo);
            return Device.get($stateParams.deviceID, ucdInfo.topoId, ucdInfo.ip).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    console.log(data[i].category === "SECURITY_DEVICE");
                    if (data[i].category === "SECURITY_DEVICE") {
                        data = data[i];
                        break;
                    }
                }

                var factoryCount = Device.getCount({
                    '$filter': 'category eq FACTORY_DEVICE'
                });
                return $q.all([
                    Device.getBlocksRef(data.blocksRef.baseUrl, ucdInfo.ip),
                    Topology.getDeviceNodes(data.deviceId, ucdInfo.ip),
                    Device.getDeviceRuleCount(ucdInfo.topoId ? ucdInfo.topoId : topologyId.id, data.deviceId, ucdInfo.ip),
                    Device.getDeviceSignatureCount(ucdInfo.topoId ? ucdInfo.topoId : topologyId.id, data.deviceId, ucdInfo.ip),
                    factoryCount,
                    Device.getDeviceDomainRuleCount(ucdInfo.topoId ? ucdInfo.topoId : topologyId.id, data.deviceId)
                ]).then(function (d) {
                    data.rules = d[0];
                    data.nodes = d[1];
                    data._rulesCount = d[2];
                    data._signaturesCount = d[3];
                    data._iconName = Device.getIconName(data.iconType);
                    var splitName = data._model_name ? data._model_name.split(' /') : [];
                    if (splitName[0] === "数控审计保护平台") {
                        data._model_name = $filter('resFilter')(splitName[0], 'slideAuditTitle') + ' /' + splitName[1];
                    }
                    data._factoryCount = d[4];
                    data._domainRulesCount = d[5];
                    console.log(data);
                    device = data;
                });
            }, function () {
                return false;
            });
        }

        var deviceIncidents;
        if (!topologyId.id) {
            return domain.getDomain().then(function () {
                promises.push(getDeviceIncidents());
            });
        } else {
            promises.push(getDeviceIncidents());
        }
        function getDeviceIncidents() {
            var now = new Date();
            var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return Incident.getIncidentsByDevice($stateParams.deviceID, moment(startOfDay).utc().format()).then(function (data) {
                deviceIncidents = data;
            });
        }

        $q.all(promises).then(function () {
            vm.simplifyModelName = deviceTypeService.simplifyModelName;
            vm.device = device;
            vm.device.showRoutingInfo = device.nodes[0] && device.nodes[0].type === 'ROUTING_IPS';
            vm.deviceIncidents = deviceIncidents;
            vm.validateIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)($|(\/([12][0-9]|3[0-2]|[0-9])))$/;
            vm.validateSubnet = /^((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}(-((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}|\/((1|2|3(?=1|2))\d|\d))\b$/;
            vm.aclData = [];
            vm.acl = {
                acls_numValidate: [],
                acls_sourceIpValidate: [],
                acls_destinationIpValidate: [],
                acls_sourcePortValidate: [],
                acls_destinationPortValidate: [],
                acls_sourceIpEdit: [],
                acls_destinationIpEdit: [],
                acls_sourcePortEdit: [],
                acls_destinationPortEdit: [],
                acls_sourcePortDisable: [],
                acls_destinationPortDisable: []
            };

            //console.log(vm.device);

            vm.validate = [];

            vm.subnetsValidate = [];

            var timeout;

            var deferred = $q.defer();

            vm.waitingDPI = deferred.promise;

            if ($rootScope.MW_SETTING !== "normal") {
                $q.all([auth.autoLogin(allInOneIP, '')]).then(function () {
                    updateDPIInfo();
                });
            } else {
                updateDPIInfo();
            }

            function updateDPIInfo() {
                if (vm.device.category === "SECURITY_DEVICE") {
                    Device.getDPIInfo(device.topologyId, device.deviceId, allInOneIP).then(function (data) {
                        vm.message = data.data;

                        if (!vm.message) {
                            vm.message = {
                                "boxId": "",
                                "cpuUsage": 0.0,
                                "maxCpuUsage": 0.0,
                                "minCpuUsage": 0.0,
                                "freeMemory": 1024000,
                                "totalMemory": 1024000,
                                "maxMemoryUsage": 0,
                                "minMemoryUsage": 0,
                                "diskUsageInMegabytes": 0,
                                "diskInMegabytes": 1000,
                                "maxDiskUsageInMegabytes": 0,
                                "minDiskUsageInMegabytes": 0,
                                "sysUpTime": 0,
                                "alarmStatus": true,
                                "cpuState": "NORMAL",
                                "memoryState": "NORMAL",
                                "diskState": "WARNING",
                                "createdAt": "2015-04-15T22:43:56Z",
                                "updatedAt": "2015-04-15T22:43:56Z",
                                "startDatetime": "2015-04-15T22:43:56Z",
                                "topologyId": "0"
                            };
                        } else {
                            deferred.resolve('success');
                            //console.log(deferred);
                        }

                        vm.timer = {
                            'second': Math.floor(vm.message.sysUpTime % 60),
                            'minute': Math.floor((vm.message.sysUpTime / 60) % 60),
                            'hour': Math.floor((vm.message.sysUpTime / 3600) % 24),
                            'day': Math.floor((vm.message.sysUpTime / 86400))
                        };

                        var hardDrive = [{
                            y: Math.round(vm.message.diskUsageInMegabytes * 100 / vm.message.diskInMegabytes),
                            color: '#76b900'
                        }, {
                            y: (vm.message.diskInMegabytes - vm.message.diskUsageInMegabytes) * 100 / vm.message.diskInMegabytes,
                            color: '#1f1f1f'
                        }];

                        var memory = [{
                            y: vm.message.totalMemory === 0 ? 0 : Math.round((vm.message.totalMemory - vm.message.freeMemory) * 100 / vm.message.totalMemory),
                            color: '#76b900'
                        }, {
                            y: vm.message.totalMemory === 0 ? 1000000 : vm.message.freeMemory * 100 / vm.message.totalMemory,
                            color: '#1f1f1f'
                        }];

                        if (!$scope.deviceCPUUsage) {
                            $scope.deviceHardDriveUsage = Device.pieChart(hardDrive, Math.round((vm.message.diskInMegabytes * 100) / (1024)) / 100, getPieThis);
                            $scope.deviceRAMUsage = Device.pieChart(memory, Math.round((vm.message.totalMemory * 100) / (1024 * 1024)) / 100, getPieThis);
                            vm.testdata = {
                                data: [{
                                    name: 'CPU使用率',
                                    data: [null, null, null, null, null, null, null, null, null, null, vm.message.cpuUsage, vm.message.cpuUsage]
                                }]
                            };
                            $scope.deviceCPUUsage = Device.lineChart(vm.testdata, getLineThis);
                        } else {
                            $scope.deviceHardDriveUsage = Device.pieChart(hardDrive, Math.round((vm.message.diskInMegabytes * 100) / (1024)) / 100, getPieThis);
                            $scope.deviceRAMUsage = Device.pieChart(memory, Math.round((vm.message.totalMemory * 100) / (1024 * 1024)) / 100, getPieThis);
                            removePoint(vm.lineChart);
                            addPoint(vm.lineChart, vm.message.cpuUsage);
                        }
                        //console.log($scope.deviceHardDriveUsage);
                    });
                    timeout = setTimeout(updateDPIInfo, 10000);
                }
            }

            $scope.$on("$destroy", function () {
                clearTimeout(timeout);
            });

            function getPieThis(chart) {
                console.log(chart);
                //removePoint(chart);
            }

            function getLineThis(chart) {
                vm.lineChart = chart;
            }

            function removePoint(chart) {
                chart.series[0].removePoint(0, false);
            }

            function addPoint(chart, p) {
                chart.series[0].addPoint(p);
            }

            vm.device.devicePorts.forEach(function (port) {
                if (!port.isMgmtPort && !port._subnets) {
                    port._subnets = [
                        //  {
                        //  "portRoutingId": "3139e4ec-c56f-4c10-bc24-83f67f800ccf",
                        //  "subnet": "10.0.10.1/24",
                        //  "portId": "bab93f2f-5517-45fd-ae98-73b00f57b4fa",
                        //  "updatedAt": "2015-02-06 20:00:31.0",
                        //  "createdAt": "2015-02-06 20:00:31.0",
                        //  "status": "NOTINUSE"
                        //},
                        //  {
                        //    "portRoutingId": "36c52ef7-730f-45aa-9121-21eb00d173d6",
                        //    "subnet": "10.0.10.3/24",
                        //    "portId": "bab93f2f-5517-45fd-ae98-73b00f57b4fa",
                        //    "updatedAt": "2015-02-06 20:00:31.0",
                        //    "createdAt": "2015-02-06 20:00:31.0",
                        //    "status": "NOTINUSE"
                        //  }
                    ];
                }
            });

            vm.editDevice = function () {
                delete vm.device.port;
                //console.log(vm.device);
                vm.editedInfo = angular.copy(vm.device);
                vm.isEdited = true;
            };

            vm.editCancel = function () {
                angular.copy(vm.editedInfo, vm.device);
                initDeviceView(vm.device);
                portMapToArr(vm.device.notConnectedPortMap);
                loadAcl();
                vm.isEdited = false;
            };

            vm.editDone = function () {
                vm.isEdited = false;
                var device = {};

                //device info
                vm.device.name = vm.editedInfo.name;

                angular.copy(vm.device, device);
                delete device.rules;
                delete device.nodes;
                delete device._policyCount;
                delete device._signaturesCount;
                delete device._iconName;
                delete device._factoryCount;
                delete device.showRoutingInfo;

                //routing info
                //console.log(device.defaultGateway);
                var newRemoteRoutingList = [];
                for (var a = 0; a < device._remoteRoutings.length; a++) {
                    newRemoteRoutingList.push({
                        'networkSegment': device._remoteRoutings[a].networkSegment,
                        'gateway': device._remoteRoutings[a].gateway
                    });
                }
                //console.log(newRemoteRoutingList);
                //subnet config
                var portInfo = getPortInfoFunction();
                device.notConnectedPortMap = portInfo.portMap;
                //console.log(portInfo);

                var devicePorts = [];
                for (var b = 0; b < device.devicePorts.length; b++) {
                    if (!device.devicePorts[b].isMgmtPort) {
                        var port = {};
                        port.portId = device.devicePorts[b].portId;
                        port._subnets = [];
                        for (var c = 0; c < device.devicePorts[b]._subnets.length; c++) {
                            if (device.devicePorts[b]._subnets[c].subnet) {
                                port._subnets.push({'subnet': device.devicePorts[b]._subnets[c].subnet});
                            }
                        }
                        devicePorts.push(port);
                    }
                }
                //ACL
                vm.confirmAcl().then(function () {
                    loadAcl();
                    //console.log(devicePorts);
                    //console.log(device);
                    Device.routing(device).then(function (data) {
                        if (data.state === 'SUCCESS') {
                            $rootScope.addAlert({
                                type: 'success',
                                content: '编辑设备成功'
                            });
                        } else {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (data.reason ? ('编辑设备失败：' + data.reason) : '编辑设备失败')
                            });
                        }
                    });
                });
            };

            vm.fillValidate = function () {
                vm.validate = [];
                for (var a = 0; a < vm.device._remoteRoutings.length; a++) {
                    vm.validate[a] = {
                        'networkSegment': true,
                        'gateway': true
                    };
                }

                vm.subnetsValidate = [];
                vm.device.devicePorts.forEach(function (port) {
                    var subnets = [];
                    if (port.isMgmtPort) {
                        vm.subnetsValidate.push(subnets);
                    } else {
                        port._subnets.forEach(function () {
                            subnets.push(true);
                        });
                        vm.subnetsValidate.push(subnets);
                    }
                });
                //console.log(vm.subnetsValidate);
            };

            vm.validateSubnets = function () {
                //console.log(vm.subnetsValidate.value);
                for (var a = 0; a < vm.subnetsValidate.length; a++) {
                    for (var b = 0; b < vm.subnetsValidate[a].length; b++) {
                        if (!vm.subnetsValidate[a][b]) {
                            vm.invalidSubnet = true;
                            return;
                        }
                    }
                }
                vm.invalidSubnet = false;
            };

            vm.validateInput = function () {
                var result = true;
                for (var a = 0; a < vm.validate.length; a++) {
                    result = result && vm.validate[a].networkSegment && vm.validate[a].gateway;
                }
                vm.invalidPorts = !result;
            };

            vm.addRouteTableItem = function () {
                vm.device._remoteRoutings.push({
                    'networkSegment': '',
                    'gateway': ''
                });
                vm.validate.push({
                    'networkSegment': false,
                    'gateway': false
                });
                vm.validateInput();
            };

            vm.deleteRouteTableItem = function (index) {
                vm.device._remoteRoutings.splice(index, 1);
                vm.validate.splice(index, 1);
                vm.validateInput();
            };

            vm.getSignatureCount = function () {
                var count = 0;
                if (vm.device.rules) {
                    for (var i = 0; i < vm.device.rules.length; i++) {
                        count += vm.device.rules[i]._signaturesCount;
                    }
                }
                return count;
            };

            vm.setSendPortFunction = function (getPortInfoFunction, initDeviceView, portMapToArr) {
                vm.getPortInfoFunction = getPortInfoFunction;
                vm.initDeviceView = initDeviceView;
                vm.portMapToArr = portMapToArr;
            };

            vm.updateDevice = function (newDevice) {
                vm.device = newDevice;
            };

            //Device ACL:
            function loadAcl() {
                Device.getACLInfo(device.deviceId).then(function (data) {
                    //console.log(device.deviceId);
                    //console.log("ACL DATA:");
                    //console.log(data);
                    vm.aclData = angular.copy(data);
                    //console.log(vm.aclData);

                    vm.acl.acls_numValidate = [];
                    vm.acl.acls_sourceIpValidate = [];
                    vm.acl.acls_destinationIpValidate = [];
                    vm.acl.acls_sourcePortValidate = [];
                    vm.acl.acls_destinationPortValidate = [];
                    vm.acl.acls_sourceIpEdit = [];
                    vm.acl.acls_destinationIpEdit = [];
                    vm.acl.acls_sourcePortEdit = [];
                    vm.acl.acls_destinationPortEdit = [];
                    vm.acl.acls_sourcePortDisable = [];
                    vm.acl.acls_destinationPortDisable = [];
                    vm.invalidAcl = false;

                    //console.log("device ID: " + device.deviceId);
                    for (var i = 0; i < vm.aclData.length; i++) {
                        if (vm.aclData[i].sourceIp === "0.0.0.0/0") {
                            vm.aclData[i].sourceIp = "ANY";
                        }
                        if (vm.aclData[i].sourcePort === "0") {
                            vm.aclData[i].sourcePort = "ANY";
                        }
                        if (vm.aclData[i].destinationIp === "0.0.0.0/0") {
                            vm.aclData[i].destinationIp = "ANY";
                        }
                        if (vm.aclData[i].destinationPort === "0") {
                            vm.aclData[i].destinationPort = "ANY";
                        }
                        if (vm.aclData[i].aclAction === 'permit') {
                            vm.aclData[i]._aclAction = '允许';
                        } else {
                            vm.aclData[i]._aclAction = '阻断';
                        }

                        vm.acl.acls_numValidate.push(true);
                        vm.acl.acls_sourceIpValidate.push(true);
                        vm.acl.acls_destinationIpValidate.push(true);
                        vm.acl.acls_sourcePortValidate.push(true);
                        vm.acl.acls_destinationPortValidate.push(true);

                        vm.acl.acls_sourceIpEdit.push((vm.aclData[i].sourceIp === 'ANY') ? false : true);
                        vm.acl.acls_destinationIpEdit.push((vm.aclData[i].destinationIp === 'ANY') ? false : true);
                        vm.acl.acls_sourcePortEdit.push((vm.aclData[i].sourcePort === 'ANY') ? false : true);
                        vm.acl.acls_destinationPortEdit.push((vm.aclData[i].destinationPort === 'ANY') ? false : true);
                        vm.acl.acls_sourcePortDisable.push((vm.aclData[i].protocolType === 'ICMP' || vm.aclData[i].protocolType === 'OPC_Classic') ? true : false);
                        vm.acl.acls_destinationPortDisable.push((vm.aclData[i].protocolType === 'ICMP' || vm.aclData[i].protocolType === 'OPC_Classic') ? true : false);
                    }
                    vm.checkValidation();
                });
            }

            loadAcl();
            vm.setErrorClass = function (b) {
                return (b ? "acl-error" : "acl-correct");
            };
            vm.checkNum = function (num, index) {
                var repeatedNum = false;
                for (var i = 0; i < vm.aclData.length; i++) {
                    if (vm.aclData[i].aclNumber.toString() === num && i !== index) {
                        repeatedNum = true;
                    }
                }
                var reg = /\D/;
                vm.acl.acls_numValidate[index] = !(repeatedNum || num === null || num === "" || num.match(reg) !== null || num < 1 || num > 1024);
                vm.checkValidation();
            };
            vm.checkIp = function (ip, index, set) {
                (set === 'source') ? vm.acl.acls_sourceIpValidate[index] = ipValidation(ip) : vm.acl.acls_destinationIpValidate[index] = ipValidation(ip);
                vm.checkValidation();
            };
            function ipValidation(ip) {
                var exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])($|(\/([12][0-9]|3[0-2]|[0-9])))$/;
                //console.log("ipValidation:" + ip.match(exp));
                return (ip.match(exp));
            }

            vm.ipChange = function (index, set) {
                (set === 'source') ? ((vm.acl.acls_sourceIpEdit[index]) ? vm.aclData[index].sourceIp = '' : vm.aclData[index].sourceIp = 'ANY') : ((vm.acl.acls_destinationIpEdit[index]) ? vm.aclData[index].destinationIp = '' : vm.aclData[index].destinationIp = 'ANY');
                (set === 'source') ? ((vm.acl.acls_sourceIpEdit[index]) ? vm.acl.acls_sourceIpValidate[index] = false : vm.acl.acls_sourceIpValidate[index] = true) : ((vm.acl.acls_destinationIpEdit[index]) ? vm.acl.acls_destinationIpValidate[index] = false : vm.acl.acls_destinationIpValidate[index] = true);
                vm.checkValidation();
                //console.log(vm.acl.acls_destinationIpEdit[index]);
            };

            vm.checkPort = function (port, index, set) {
                (set === 'source') ? vm.acl.acls_sourcePortValidate[index] = portValidation(port) : vm.acl.acls_destinationPortValidate[index] = portValidation(port);
                vm.checkValidation();
            };
            function portValidation(port) {
                var re = /^[1-9]+[0-9]*]*$/;
                return (!re.test(port)) ? false : ((parseInt(port) < 1 || parseInt(port) > 65535) ? false : true);
            }

            vm.portChange = function (index, set) {
                (set === 'source') ? ((vm.acl.acls_sourcePortEdit[index]) ? vm.aclData[index].sourcePort = '' : vm.aclData[index].sourcePort = 'ANY') : ((vm.acl.acls_destinationPortEdit[index]) ? vm.aclData[index].destinationPort = '' : vm.aclData[index].destinationPort = 'ANY');
                (set === 'source') ? ((vm.acl.acls_sourcePortEdit[index]) ? vm.acl.acls_sourcePortValidate[index] = false : vm.acl.acls_sourcePortValidate[index] = true) : ((vm.acl.acls_destinationPortEdit[index]) ? vm.acl.acls_destinationPortValidate[index] = false : vm.acl.acls_destinationPortValidate[index] = true);

                vm.checkValidation();
                //console.log(vm.acl.acls_destinationPortEdit[index]);
            };
            vm.checkAclProtocol = function (protocolType, index) {
                if (protocolType === "ICMP" || protocolType === "OPC_Classic") {
                    vm.aclData[index].sourcePort = "-1";
                    vm.aclData[index].destinationPort = "-1";
                    vm.acl.acls_sourcePortDisable[index] = true;
                    vm.acl.acls_destinationPortDisable[index] = true;
                    vm.acl.acls_sourcePortEdit[index] = false;
                    vm.acl.acls_destinationPortEdit[index] = false;
                } else {
                    vm.acl.acls_sourcePortEdit[index] = false;
                    vm.acl.acls_destinationPortEdit[index] = false;
                    vm.acl.acls_sourcePortDisable[index] = false;
                    vm.acl.acls_destinationPortDisable[index] = false;
                }
                vm.portChange(index, "source");
                vm.portChange(index, "destination");
            };
            vm.addAcl = function () {
                var nextIndex = 1;
                for (var i = 0; i < vm.aclData.length; i++) {
                    nextIndex = (nextIndex > vm.aclData[i].aclNumber) ? nextIndex : (parseInt(vm.aclData[i].aclNumber) + 1);
                }
                vm.aclData.push({
                    aclNumber: nextIndex,
                    aclAction: "permit",
                    sourceIp: "ANY",
                    destinationIp: "ANY",
                    protocolType: "ANY",
                    sourcePort: "ANY",
                    destinationPort: "ANY",
                    aclLog: false
                });

                vm.acl.acls_numValidate.push(true);
                vm.acl.acls_sourceIpValidate.push(true);
                vm.acl.acls_destinationIpValidate.push(true);
                vm.acl.acls_sourcePortValidate.push(true);
                vm.acl.acls_destinationPortValidate.push(true);

                vm.acl.acls_sourceIpEdit.push(false);
                vm.acl.acls_destinationIpEdit.push(false);
                vm.acl.acls_sourcePortEdit.push(false);
                vm.acl.acls_destinationPortEdit.push(false);
                vm.checkValidation();
            };
            vm.deleteSingleAcl = function (index) {
                var ACLId = [{"deviceACLId": vm.aclData[index].deviceACLId}];
                Device.deleteACL(device.deviceId, ACLId).then(function () {
                    vm.aclData.splice(index, 1);
                    vm.acl.acls_numValidate.splice(index, 1);
                    vm.acl.acls_sourceIpValidate.splice(index, 1);
                    vm.acl.acls_destinationIpValidate.splice(index, 1);
                    vm.acl.acls_sourcePortValidate.splice(index, 1);
                    vm.acl.acls_destinationPortValidate.splice(index, 1);
                    vm.acl.acls_sourceIpEdit.splice(index, 1);
                    vm.acl.acls_destinationIpEdit.splice(index, 1);
                    vm.acl.acls_sourcePortEdit.splice(index, 1);
                    vm.acl.acls_destinationPortEdit.splice(index, 1);
                    vm.acl.acls_sourcePortDisable.splice(index, 1);
                    vm.acl.acls_destinationPortDisable.splice(index, 1);
                    vm.checkValidation();
                });
            };
            vm.checkValidation = function () {
                var validAcl = true;
                for (var i = 0; i < vm.aclData.length; i++) {
                    validAcl &= vm.acl.acls_numValidate[i] && vm.acl.acls_sourceIpValidate[i] && vm.acl.acls_destinationIpValidate[i] && vm.acl.acls_sourcePortValidate[i] && vm.acl.acls_destinationPortValidate[i];
                    if (!validAcl) {
                        console.log(i + ": " + vm.acl.acls_numValidate[i] + " sourceip:" + vm.acl.acls_sourceIpValidate[i] + " destinationip:" + vm.acl.acls_destinationIpValidate[i] + " sourcePort:" + vm.acl.acls_sourcePortValidate[i] + " destinationPort:" + vm.acl.acls_destinationPortValidate[i]);
                    }
                }
                vm.invalidAcl = !validAcl;
                //console.log("ACL Invalidation:" + vm.invalidAcl);
            };
            vm.confirmAcl = function () {
                var deferred = $q.defer();

                vm.checkValidation();
                if (!vm.invalidAcl) {
                    var ids = [];
                    for (var j = 0; j < vm.aclData.length; j++) {
                        if (vm.aclData[j].deviceACLId !== undefined) {
                            ids.push(vm.aclData[j].deviceACLId);
                        }
                    }

                    if (ids.length > 0) {
                        var ACLId = [{"deviceACLId": ids}];
                        Device.deleteACL(device.deviceId, ACLId).then(function (data) {
                            console.log("delete ACL:" + data.data);
                            vm.checkValidation();

                            processAddACL().then(function () {
                                deferred.resolve('SUCCESS');
                            });
                        });
                    } else {
                        processAddACL().then(function () {
                            deferred.resolve('SUCCESS');
                        });
                    }
                }

                return deferred.promise;
            };

            function processAddACL() {
                vm.acl.acls_numValidate = [];
                vm.acl.acls_sourceIpValidate = [];
                vm.acl.acls_destinationIpValidate = [];
                vm.acl.acls_sourcePortValidate = [];
                vm.acl.acls_destinationPortValidate = [];

                var promises = [];
                for (var i = 0; i < vm.aclData.length; i++) {
                    if (vm.aclData[i].sourceIp === "ANY") {
                        vm.aclData[i].sourceIp = "0.0.0.0/0";
                    }
                    if (vm.aclData[i].sourcePort === "ANY") {
                        vm.aclData[i].sourcePort = "0";
                    }
                    if (vm.aclData[i].destinationIp === "ANY") {
                        vm.aclData[i].destinationIp = "0.0.0.0/0";
                    }
                    if (vm.aclData[i].destinationPort === "ANY") {
                        vm.aclData[i].destinationPort = "0";
                    }
                    if (vm.aclData[i].sourceIp.indexOf("/") < 0) {
                        vm.aclData[i].sourceIp += "/32";
                    }
                    if (vm.aclData[i].destinationIp.indexOf("/") < 0) {
                        vm.aclData[i].destinationIp += "/32";
                    }
                    var ACLdata = {
                        "aclNumber": vm.aclData[i].aclNumber,
                        "aclAction": vm.aclData[i].aclAction,
                        "aclLog": vm.aclData[i].aclLog,
                        "sourceIp": vm.aclData[i].sourceIp,
                        "sourcePort": vm.aclData[i].sourcePort,
                        "destinationIp": vm.aclData[i].destinationIp,
                        "destinationPort": vm.aclData[i].destinationPort,
                        "protocolType": vm.aclData[i].protocolType,
                        "protocolTypeName": vm.aclData[i].protocolType
                    };
                    //console.log("add ACL data:" + ACLdata);
                    promises.push(Device.addACL(device.deviceId, ACLdata));
                }
                return $q.all(promises).then(function (results) {
                    console.log(results);
                });
            }

            //Device Ports:
            var ports = [];
            var portArr = [];
            vm.validateIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)($|(\/([12][0-9]|3[0-2]|[0-9])))$/;
            vm.validateSubnet = /^((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}(-((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}|\/((1|2|3(?=1|2))\d|\d))\b$/;


            device.devicePorts.forEach(function (port) {
                if (!port.isMgmtPort) {
                    ports.push(port);
                } else {
                    vm.mgmt = port;
                }
            });

            vm.port = device.port || {};
            initDeviceView();
            portMapToArr(device.notConnectedPortMap);

            vm.changeTopoStatus = function (p1, p2) {
                //console.log(vm.port[p1][p2]);
                if (vm.port[p1][p2].model) {
                    portArr = portArr.filter(function (port) {
                        return port !== vm.port[p1][p2].port;
                    });
                } else {
                    portArr.push(vm.port[p1][p2].port);
                }

            };

            vm.updateSubnetStatus = function (portIndex, subnetIndex, subnetStatus, subnetValue) {
                //console.log(portIndex);
                //console.log(subnetIndex);
                //console.log(subnetStatus);
                //console.log(subnetValue);
                if (subnetStatus === 'delete') {
                    device.devicePorts[portIndex]._subnets.splice(subnetIndex, 1);
                    vm.subnetsValidate[portIndex].splice(subnetIndex, 1);
                } else if (subnetStatus === 'add') {
                    //console.log(device.devicePorts[portIndex]);
                    device.devicePorts[portIndex]._subnets.push({'subnet': ''});
                    vm.subnetsValidate[portIndex].push(true);
                } else {
                    subnetStatus = subnetValue ? vm.validateSubnet.test(subnetValue) : true;
                    vm.subnetsValidate[portIndex][subnetIndex] = subnetStatus;
                }
                vm.validateSubnets();
            };

            function getPortInfoFunction() {
                var str = portArr.join('],[');
                str = str && '[' + str + ']';
                //console.log(str);
                return {'portMap': str};
            }


            function initDeviceView(newDevice) {
                if (newDevice) {
                    vm.device = newDevice;
                    portArr = [];
                }

                if (vm.device.port) {
                    return;
                }
                for (var c = 0; c < ports.length; c++) {
                    vm.port[ports[c].portName] = {};
                }

                for (var i = 0; i < ports.length; i++) {
                    for (var j = 0; j < ports.length; j++) {
                        if (i !== j && vm.port[ports[i].portName][ports[j].portName] === undefined) {
                            vm.port[ports[i].portName][ports[j].portName] = vm.port[ports[j].portName][ports[i].portName] = {
                                model: true,
                                port: ports[i].portName + ',' + ports[j].portName
                            };
                        }
                    }
                }
                //console.log(vm.port);
            }

            function portMapToArr(input) {
                if (input && !device.port) {
                    portArr = input.substring(1, input.length - 1).split('],[');
                    portArr.forEach(function (port) {
                        var substrArr = port.split(',');
                        vm.port[substrArr[0]][substrArr[1]].model = false;
                    });
                    device.port = vm.port;
                }
            }
        });
    }

    function ModalInstanceCtrl($scope, $modalInstance, Device, categories) {
        var vm = $scope.newDevice = {};
        vm.step = 1;

        stepOne();

        vm.previous = function () {
            vm.step--;
        };

        vm.next = function () {
            vm.step++;
        };

        vm.done = function () {
            $scope.device['modelIdentifier'] = $scope.device['model'];
            delete $scope.device['model'];
            //console.log($scope.device);
            Device.createDevice($scope.device).then(function (data) {
                console.log(data);
            });
            $modalInstance.close('done');
        };

        vm.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        ////////////
        function stepOne() {
            //console.log(categories);
            var device = $scope.device = {};
            var forms = $scope.forms = {};

            device.category = 'SECURITY_DEVICE';
            device.name = '新设备';
            forms.category = _.uniq(categories, 'category').map(function (data) {
                return data.category;
            });

            // CS-2061 temporary solution, remove the network device.
            var indexOfNetworkDevice = forms.category.indexOf('NETWORK_DEVICE');
            forms.category.splice(indexOfNetworkDevice, 1);

            //device.category = forms.category[0];

            (function t(filter) {
                if (filter === 'version') {
                    vm.select = t;
                    return;
                }
                var params = getParams();
                var select = params[filter]['$select'];

                Device.getModels(params[filter]).then(function (data) {
                    forms[select] = _.unique(data, select).map(function (data) {
                        return data[select];
                    });
                    device[select] = '';
                    return select;
                }).then(function (data) {
                    t(data);
                });
            })('category');

            //////////
            function getParams() {
                return {
                    category: {
                        "$select": "make",
                        "$filter": "category eq " + device.category,
                        "$limit": 1000000
                    },
                    make: {
                        "$select": "model",
                        "$filter": "category eq " + device.category + " and make eq '" + device.make + "'",
                        "$limit": 1000000
                    },
                    model: {
                        "$select": "version",
                        "$filter": "category eq " + device.category + " and make eq '" + device.make + "' and model eq '" + device.model + "'",
                        "$limit": 1000000
                    }
                };
            }
        }
    }

    function DeviceModelCtrl() {
        var vm = this;
        port(vm);

        //////////
        function port(vm) {
            vm.selectedPort = 'mgmt';
            vm.ports = [{
                name: 'P0/P1',
                mode: 'IDS',
                status: 1,
                sub: [{
                    name: 'P0',
                    status: 1
                }, {
                    name: 'P1',
                    status: 1
                }]
            }, {
                name: 'P2/P3',
                mode: 'IDS',
                status: 1,
                sub: [{
                    name: 'P2',
                    status: 0
                }, {
                    name: 'P3',
                    status: 1
                }]
            }];

            vm.selectPort = function (port) {
                var index;
                if (port === 'P0' || port === 'P1') {
                    index = 0;
                } else if (port === 'P2' || port === 'P3') {
                    index = 1;
                } else {
                    vm.selectedPort = port;
                    return;
                }

                if (vm.ports[index].mode === 'IPS') {
                    vm.selectedPort = vm.ports[index].name;
                } else {
                    vm.selectedPort = port;
                }
            };

            vm.is = function (option1, option2) {
                return vm.selectedPort === option1 || vm.selectedPort === option2;
            };

            vm.portsWidth = function () {
                var panelNum = 1;
                for (var i = 0; i < vm.ports.length; i++) {
                    panelNum += vm.ports[i].mode === 'IDS' ? 2 : 1;
                }
                return 290 * panelNum;
            };
        }
    }
})();
