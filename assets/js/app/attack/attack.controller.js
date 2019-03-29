/**
 * Attack Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.attack')
        .controller('AttackCtrl', AttackCtrl);

    function AttackCtrl($scope, $compile, $filter, Attack, AttackedDevice, AttackedPath, Topology, $rootScope, topologyId, domain) {
        var vm = this,
            attackedDevice, attackedPath;
        $scope.attackDirective = {
            'selectedDevice': null
        };
        $scope.topo = {};
        $scope.uploader = new Object({});
        // init global val
        vm.editSelectedDevice;
        vm.queryArray = [];
        vm.attackTarget = [];
        vm.targetQuery = [];
        vm.targetElement = [];
        vm.attackDevcie = [];
        vm.attackDeviceTableShow = [];
        vm.deviceSelectedName = null;
        vm.attackPathArray = [];
        vm.targets = [];

        vm.switchPath = function (len) {
            Attack.getPath(topologyId.id).then(function (data) {
                $scope.currentPath = data.data[len];
                Attack.getAttackTarget($scope.currentPath.pathId).then(function (data) {
                    if (data.data.length === 0) {
                        vm.attackTarget = data.data;
                        vm.attackTarget.push("default");
                    } else {
                        vm.attackTarget = data.data;
                        vm.attackTarget.push("default");
                    }
                });
            });

            //Topology.getCurrentTopo().then(function(data) {
            //  $scope.topo = data;
            //  Attack.getPath(data.topologyId).then(function(data) {
            //    console.log(data.data[len]);
            //    $scope.currentPath = data.data[len];
            //    Attack.getAttackTarget($scope.currentPath.pathId).then(function (data) {
            //      console.log(data.data.length);
            //      console.log(data.data);
            //      if (data.data.length === 0) {
            //        vm.attackTarget = data.data;
            //        vm.attackTarget.push("default");
            //        console.log(vm.attackTarget);
            //      } else {
            //        vm.attackTarget = data.data;
            //        console.log(vm.attackTarget);
            //        vm.attackTarget.push("default");
            //      }
            //    });
            //  });
            //});
        };

        vm.addPath = function (len) {
            if (len >= 1) {
                // console.log(attackedPath);
                // console.log(vm.attackTarget);
                attackedPath.setAttackedTargetArray(vm.attackTarget);
                // console.log(attackedPath);
                //Topology.getCurrentTopo().then(function (data) {
                //    $scope.topo = data;
                //    // console.log($scope.topo);
                //    Attack.createAttackPath(data.topologyId, {
                //        "pathName": "攻击路径" + (len + 1)
                //    }).then(function (data) {
                //        console.log(data.data);
                //        $scope.currentPath = data.data;
                //        attackedPath = new AttackedPath();
                //        // console.log(attackedPath);
                //        attackedPath.setTopologyId($scope.currentPath.topologyId);
                //        attackedPath.setPathId($scope.currentPath.pathId);
                //        attackedPath.setName($scope.currentPath.pathName);
                //        vm.attackPathArray.push(attackedPath);
                //        // console.log(attackedPath);
                //    });
                //});

                // console.log($scope.topo);
                Attack.createAttackPath(topologyId.id, {
                    "pathName": "攻击路径" + (len + 1)
                }).then(function (data) {
                    $scope.currentPath = data.data;
                    attackedPath = new AttackedPath();
                    // console.log(attackedPath);
                    attackedPath.setTopologyId($scope.currentPath.topologyId);
                    attackedPath.setPathId($scope.currentPath.pathId);
                    attackedPath.setName($scope.currentPath.pathName);
                    vm.attackPathArray.push(attackedPath);
                    // console.log(attackedPath);
                });

            } else if (len === 0) {
                domain.getDomain().then(function () {
                    Attack.getPath(topologyId.id).then(function (data) {
                        if (data.data.length) {
                            // console.log(data.data);
                            // console.log(data.data.length);
                            $scope.currentPath = data.data[0];
                            // console.log($scope.currentPath);
                            for (var i = 0; i < data.data.length; i++) {
                                attackedPath = new AttackedPath(data.data[i]);
                                // console.log(attackedPath);
                                vm.attackPathArray.push(attackedPath);
                            }
                            vm.getAllTargets();
                        } else {
                            Attack.createAttackPath(topologyId.id, {
                                "pathName": "攻击路径" + (len + 1)
                            }).then(function (data) {
                                $scope.currentPath = data.data;
                                attackedPath = new AttackedPath();
                                // console.log(attackedPath);
                                attackedPath.setTopologyId($scope.currentPath.topologyId);
                                attackedPath.setPathId($scope.currentPath.pathId);
                                attackedPath.setName($scope.currentPath.pathName);
                                vm.attackPathArray.push(attackedPath);
                                // console.log(attackedPath);
                            });
                        }
                    });
                });


                //Topology.getCurrentTopo().then(function (data) {
                //  //get current topology
                //  $scope.topo = data;
                //  // console.log(data);
                //  Attack.getPath(data.topologyId).then(function (data) {
                //    console.log(data.data);
                //    if (data.data.length) {
                //      // console.log(data.data);
                //      // console.log(data.data.length);
                //      $scope.currentPath = data.data[0];
                //      // console.log($scope.currentPath);
                //      for (var i = 0; i < data.data.length; i++) {
                //        attackedPath = new AttackedPath(data.data[i]);
                //        // console.log(attackedPath);
                //        vm.attackPathArray.push(attackedPath);
                //      }
                //      vm.getAllTargets();
                //    } else {
                //      Attack.createAttackPath($scope.topo.topologyId, {
                //        "pathName": "攻击路径" + (len + 1)
                //      }).then(function (data) {
                //        console.log(data.data);
                //        $scope.currentPath = data.data;
                //        attackedPath = new AttackedPath();
                //        // console.log(attackedPath);
                //        attackedPath.setTopologyId($scope.currentPath.topologyId);
                //        attackedPath.setPathId($scope.currentPath.pathId);
                //        attackedPath.setName($scope.currentPath.pathName);
                //        vm.attackPathArray.push(attackedPath);
                //        // console.log(attackedPath);
                //      });
                //    }
                //  });
                //});
            }
            vm.attackTarget = ["default"];
        };

        vm.getAllPath = function (len) {
            if (len === 0) {
                vm.addPath(0);
            } else {
                Attack.getPath(topologyId.id).then(function (data) {
                    if (data.data.length) {
                        // console.log(data.data);
                        // console.log(data.data.length);
                        for (var i = 0; i < data.data.length; i++) {
                            attackedPath = new AttackedPath(data.data[i]);
                            // console.log(attackedPath);
                            vm.attackPathArray.push(attackedPath);
                        }
                    } else {
                        Attack.createAttackPath(topologyId.id, {
                            "pathName": "攻击路径" + (len + 1)
                        }).then(function (data) {
                            $scope.currentPath = data.data;
                            attackedPath = new AttackedPath();
                            // console.log(attackedPath);
                            attackedPath.setTopologyId($scope.currentPath.topologyId);
                            attackedPath.setPathId($scope.currentPath.pathId);
                            attackedPath.setName($scope.currentPath.pathName);
                            vm.attackPathArray.push(attackedPath);
                            // console.log(attackedPath);

                            vm.getAllTargets();
                        });
                    }
                });

                //Topology.getCurrentTopo().then(function (data) {
                //  //get current topology
                //  // console.log("get all path");
                //  $scope.topo = data;
                //
                //  Attack.getPath(data.topologyId).then(function (data) {
                //    if (data.data.length) {
                //      // console.log(data.data);
                //      // console.log(data.data.length);
                //      for (var i = 0; i < data.data.length; i++) {
                //        attackedPath = new AttackedPath(data.data[i]);
                //        // console.log(attackedPath);
                //        vm.attackPathArray.push(attackedPath);
                //      }
                //    } else {
                //      // console.log("dfdfdfdfdfds");
                //      Attack.createAttackPath($scope.topo.topologyId, {
                //        "pathName": "攻击路径" + (len + 1)
                //      }).then(function (data) {
                //        $scope.currentPath = data.data;
                //        attackedPath = new AttackedPath();
                //        // console.log(attackedPath);
                //        attackedPath.setTopologyId($scope.currentPath.topologyId);
                //        attackedPath.setPathId($scope.currentPath.pathId);
                //        attackedPath.setName($scope.currentPath.pathName);
                //        vm.attackPathArray.push(attackedPath);
                //        // console.log(attackedPath);
                //
                //        vm.getAllTargets();
                //      });
                //    }
                //  });
                //});
            }
        };

        vm.getAllTargets = function () {
            // console.log($scope.currentPath.pathId);
            Attack.getAttackTarget($scope.currentPath.pathId).then(function (data) {
                // console.log(data.data);

                vm.attackTarget.splice(-1, 1);
                for (var i = 0; i < data.data.length; i++) {
                    // console.log(data.data[i]);
                    vm.attackTarget.push(data.data[i]);
                }
                vm.attackTarget.push("default");
            });
        };

        /* create table result when queried */
        vm.attackDeviceTableToggle = function (index) {
            vm.attackDeviceTableShow[index] = !vm.attackDeviceTableShow[index];
            //console.log(vm.attackDeviceTableShow[index]);
        };

        vm.attackDeviceTableHide = function (index) {
            vm.attackDeviceTableShow[index] = false;
            //console.log(vm.attackDeviceTableShow[index]);
        };

        /* show create target query tab when clicked*/
        vm.createTargetTab = function (index) {
            for (var i = 0; i < vm.targetQuery.length; i++) {
                if (i !== index) {
                    vm.targetQuery[i] = false;
                }
            }
            vm.targetQuery[index] = !vm.targetQuery[index];
        };

        /* edit target query information when clicked*/
        vm.editTargetTab = function (index) {
            vm.createTargetTab(index);
            Attack.getAttackTarget($scope.currentPath.pathId).then(function (data) {
                // console.log(index+1);
                vm.selectedTarget = data.data[index].selectedTarget;
                vm.selectedMethod = data.data[index].attackMethod;
                vm.selectedDescription = data.data[index].customDescription;
                vm.selectedResult = data.data[index].description;
                vm.deviceSelectedName = data.data[index].targetName;
                vm.attackDevice = data.data[index].attackTargetList;
                vm.attackAttachedFile = data.data[index].attachedFile;
                $scope.attackDirective.selectedDevice = data.data[index].selectedTarget;
                vm.editTargetId = data.data[index].targetId;
                // vm.editSelectedDevice.deviceName = data.data[index].targetName;
                // $scope.attackDirective.selectedDevice =
                // console.log(vm.editSelectedDevice.deviceName);
            });
        };

        vm.clearTab = function () {
            vm.selectedMethod = null;
            vm.selectedDescription = null;
            vm.selectedResult = null;
            vm.deviceSelectedName = null;
            vm.attackDevice = null;
        };

        /* create a attacked device object which under AttackedDevice*/
        vm.createAttackTarget = function () {
            /* new object */
            attackedDevice = new AttackedDevice();

            vm.attackTarget.push(1);
        };
        /*
         vm.attackTarget = function (state) {
         vm.targetQuery = state;
         };
         */

        // /* create device target query data*/
        // vm.target = function() {
        //     var query =

        //     return Attack.get();
        // };


        // /* get query information from backend*/
        // function createQuery() {
        //     // vm.target().then(function(data){
        //     //     vm.targets =data;
        //         vm.addQueryElement(0);
        //         // console.log(333333);
        //     // });
        // }
        /*
         vm.attackMethod = function() {
         return Attack.getAttackMethod();
         };*/

        /* query relations hardcode*/
        vm.relation = function () {
            vm.relations = [];
            Attack.getQuery().then(function (data) {
                vm.targets = data.data;
                vm.addQueryElement(0);
            });
        };

        /* create query element*/
        vm.addQueryElement = function () {
            // console.log(vm.targets);
            var queryElement = {};
            // console.log(vm.queryArray.length);
            queryElement.selectedSearchField = vm.targets[0].searchField;
            queryElement.selectedSearchName = vm.targets[0].searchName;
            //console.log(vm.targets[0].operatorType[0]);
            //console.log(($filter('selectConvert')(vm.targets[0].operatorType[0])[0]));
            queryElement.selectedOperator = ($filter('selectConvert')(vm.targets[0].operatorType[0])).toString();
            //console.log(queryElement.selectedOperator);
            queryElement.detail = vm.targets[0];

            if (vm.queryArray.length > 0) {
                queryElement.relatedCondition = 'and';
            } else {
                queryElement.relatedCondition = 'none';
            }
            queryElement.method = 'select';
            // queryElement.infor =

            Attack.getQueryDetail(topologyId.id, queryElement.selectedSearchName).then(function (detail) {
                // console.log(detail.data);
                queryElement.infor = detail.data;
                // console.log(queryElement.infor);
                queryElement.selectedInfor = queryElement.infor[0];
                // console.log(vm.queryArray[0].target.infor);
                // vm.queryArray[0].target.infor = detail.data;
                // console.log(queryElement);
                // if(vm.queryArray.length>=1){
                //     console.log(vm.queryArray);
                //     console.log(vm.queryArray.length);
                // } else {
                //     console.log('query array has no shit');
                // }
                // console.log(queryElement);

                vm.queryArray.push(queryElement);
                // console.log(vm.queryArray);
            });

            //Topology.getCurrentTopo().then(function (data) {
            //    // console.log(data);
            //    $scope.topo = data;
            //    Attack.getQueryDetail($scope.topo.topologyId, queryElement.selectedSearchName).then(function(detail){
            //        // console.log(detail.data);
            //        queryElement.infor= detail.data;
            //        // console.log(queryElement.infor);
            //        queryElement.selectedInfor = queryElement.infor[0];
            //        // console.log(vm.queryArray[0].target.infor);
            //        // vm.queryArray[0].target.infor = detail.data;
            //        // console.log(queryElement);
            //        // if(vm.queryArray.length>=1){
            //        //     console.log(vm.queryArray);
            //        //     console.log(vm.queryArray.length);
            //        // } else {
            //        //     console.log('query array has no shit');
            //        // }
            //        // console.log(queryElement);
            //
            //        vm.queryArray.push(queryElement);
            //        // console.log(vm.queryArray);
            //    });
            //});

            // Attack.getQuery().then(function(data) {
            //     console.log(data.data);
            //     console.log(vm.targets);
            //     for (var i = 0; i < data.data.length; i++) {
            //         console.log(data.data[i]);
            //         vm.targets[i] = {};
            //         // vm.targets[i].infor = '';
            //         vm.targets[i].name = data.data[i].searchField;
            //         vm.targets[i].searchName = data.data[i].searchName;
            //         vm.targets[i].operatorType = data.data[i].operatorType;
            //         vm.targets[i].method = 'select';
            //         vm.targets[i].infor = '';
            //         vm.targets[i].selectedOperator = '';
            //         // vm.targets[i].name = data.data[i].searchFeild;

            //     };
            //     vm.targetElement[index] = {
            //         'target': vm.targets[0]
            //     };
            //     vm.relations = vm.targets[0].operatorType;
            //     // Attack.
            //     vm.queryDetail = [];
            //     Topology.getCurrentTopo().then(function (data) {
            //         console.log(data);
            //         $scope.topo = data;
            //         Attack.getQueryDetail($scope.topo.topologyId, vm.targets[0].searchName).then(function(detail){
            //             console.log(detail.data);
            //             vm.queryDetail= detail.data;
            //             console.log(vm.queryDetail);
            //             vm.targetElement[index].target.infor = vm.queryDetail;
            //             vm.queryArray.push(vm.targetElement[index]);
            //             for (var i = 0; i < vm.queryArray.length; i++) {
            //                 console.log(vm.queryArray[i].target);
            //             };
            //         });
            //     });
            //     console.log(vm.targetElement);
            //     console.log(vm.queryArray);
            //     console.log(vm.relations);
            // });

            // console.log(vm.queryArray);
            // console.log(vm.targetElement[index]);
        };

        vm.getQueryDetail = function () {
            // console.log($scope.topo);
            Attack.getQueryDetail(topologyId.id).then(function (detail) {
                // console.log(detail.data);
                vm.queryDetail = detail.data;
                // console.log(vm.queryDetail);
            });

            //Topology.getCurrentTopo().then(function (data) {
            //  // console.log(data);
            //  $scope.topo = data;
            //  Attack.getQueryDetail($scope.topo.topologyId).then(function(detail){
            //    // console.log(detail.data);
            //    vm.queryDetail= detail.data;
            //    // console.log(vm.queryDetail);
            //  });
            //});
        };

        vm.deleteQueryElement = function (index) {
            vm.queryArray.splice(index, 1);
        };

        // vm.setTargetOperator = function() {
        //     console.log("shit");
        // };

        /* set default target when select changes*/
        vm.setDefaultTargetValue = function (item, index) {
            // console.log(item);
            // console.log(index);
            // console.log(vm.targets);
            // console.log(vm.queryArray[index]);
            vm.queryArray[index].selectedOperator = ($filter('selectConvert')(vm.queryArray[index].detail.operatorType[0])).toString();
            vm.queryArray[index].selectedSearchName = vm.queryArray[index].detail.searchName;
            vm.queryArray[index].selectedSearchField = vm.queryArray[index].detail.searchField;
            // console.log(vm.queryArray.target[0].infor);
            // vm.relations = item.detail.operatorType;

            Attack.getQueryDetail(topologyId.id, vm.queryArray[index].detail.searchName).then(function (detail) {
                vm.queryDetail = detail.data;
                // console.log(vm.queryArray);
                vm.queryArray[index].infor = detail.data;
                vm.queryArray[index].selectedInfor = detail.data[0];
                // console.log(vm.queryArray[0].target.infor);
                // vm.queryArray[0].target.infor = detail.data;
                // console.log(vm.queryArray);
            });

            //Topology.getCurrentTopo().then(function (data) {
            //  // console.log(data);
            //  $scope.topo = data;
            //  Attack.getQueryDetail($scope.topo.topologyId, vm.queryArray[index].detail.searchName).then(function(detail){
            //    console.log(detail.data);
            //    vm.queryDetail= detail.data;
            //    // console.log(vm.queryArray);
            //    vm.queryArray[index].infor = detail.data;
            //    vm.queryArray[index].selectedInfor = detail.data[0];
            //    // console.log(vm.queryArray[0].target.infor);
            //    // vm.queryArray[0].target.infor = detail.data;
            //    // console.log(vm.queryArray);
            //  });
            //});
            //
            // if (item.method === 'select') {
            //     item.targetValue = item.infor[0];
            // }
        };

        /* create query arracy --- not finished*/
        vm.sendQueryRequest = function () {
            // console.log(vm.queryArray);
            attackedDevice.setQuery(vm.queryArray);
            // console.log(vm.queryArray);
            // console.log(index);
            var condition = "nodes?$filter=";
            //Topology.getCurrentTopo().then(function (data) {
            //    console.log(data);

            for (var i = 0; i < vm.queryArray.length; i++) {
                // console.log(vm.queryArray[i]);
                if (vm.queryArray[i].relatedCondition !== 'none') {
                    condition += " " + vm.queryArray[i].relatedCondition + " ";
                }

                vm.queryArray[i].selectedOperator = $filter('selectConvertBack')(vm.queryArray[i].selectedOperator);
                // console.log(t);
                // console.log(vm.queryArray);

                if (vm.queryArray[i].selectedOperator === 'co') {
                    // console.log('this is co');
                    condition += "contains(" + vm.queryArray[i].selectedSearchName + ", '" + vm.queryArray[i].selectedInfor + "')";
                } else {
                    condition += vm.queryArray[i].selectedSearchName + ' ' + vm.queryArray[i].selectedOperator + " '" + vm.queryArray[i].selectedInfor + "'";
                }
                // console.log(condition);
            }
            // condition += vm.queryArray[0].target.searchName + ' ' + vm.queryArray[0].target.selectedOperator + " '" + vm.queryArray[0].target.targetValue + "'";
            // for (var i = 0; i < vm.queryArray.length; i++) {
            //     if (vm.queryArray[i].target) {
            //         console.log(vm.queryArray[i].target);
            //         if (vm.queryArray[i].target.name === "任意") {
            //             console.log("renyi");
            //             condition = "/nodes";
            //         } else if (vm.queryArray[i].target.name === "硬件接口") {
            //             console.log("yingjian");
            //             if (vm.queryArray[i].target.targetValue === "USB" ) {
            //                 console.log("USB");
            //                 condition += "hasUSB%20eq%20true";
            //                 console.log(condition);
            //             } else if (vm.queryArray[i].target.targetValue === "Wireless") {
            //                 console.log("wireless");
            //                 condition += "hasWireless%20eq%20true";
            //                 console.log(condition);
            //             }
            //         } else if (vm.queryArray[i].target.name === "漏洞严重性") {
            //             console.log("漏洞严重性");
            //             if (vm.queryArray[i].target.targetValue === "Low") {
            //                 console.log("Low");
            //                 condition += "Severity%20eq%20Low";
            //             } else if (vm.queryArray[i].target.targetValue === "Medium") {
            //                 console.log("Medium");
            //                 condition += "Severity%20eq%20Medium";
            //             } else if (vm.queryArray[i].target.targetValue === "High") {
            //                 console.log("High");
            //                 condition += "Severity%20eq%20High";
            //             }
            //         } else {
            //             condition = "/nodes";
            //         }
            //     }
            // }

            Attack.getAttackTargetFilter($scope.currentPath.topologyId, $scope.currentPath.pathId, condition).then(function (data) {
                console.log(data.data);
                vm.attackDevice = data.data;
            });
            //});
            // console.log(attackedDevice.queryArray);
        };


        vm.getInputDevice = function (device) {
            console.log(device);
            vm.editSelectedDevice = device;
        };

        /* device Checked will confirmed*/
        vm.deviceChecked = function () {
            // console.log(vm.editSelectedDevice);
            if (vm.editSelectedDevice) {
                vm.deviceSelectedName = vm.editSelectedDevice.nodeName;
                attackedDevice.setSelectedDevice(vm.editSelectedDevice.nodeId);
                // vm.deviceTable = attackedDevice.table;
            } else {
                // vm.deviceSelectedName = null;
                console.log("you did not select a device!");
                console.log($scope.attackDirective.selectedDevice);
            }
            // console.log(attackedDevice.getSelectedDevice());
            // console.log($scope.attackDirective.selectedDevice.ID);
        };

        /* set Attack Method when step 2 at the query tab */
        vm.setAttackMethod = function () {
            vm.attackMethod = ['自定义手段'];
        };

        /*        vm.idSelectedDevice = null;
         vm.setSelected = function () {
         $scope.idSelectedDevice = idSelectedDevice;
         console.log(idSelectedDevice);
         };
         */
        /* FINISHed query then sedn attack methend to backend */
        vm.sendMethod = function () {
            /* fail to go to next step*/
            if (vm.selectedMethod === vm.attackMethod[0]) {
                console.log(vm.selectedMethod + ' has problem');
            } else {
                console.log(vm.selectedMethod);
            }

            var attackMethodOutput = {
                method: vm.selectedMethod,
                description: vm.selectedDescription
            };

            if (!attackMethodOutput.method) {
                attackMethodOutput.method = null;
                // console.log("no method");
            }
            if (!attackMethodOutput.description) {
                attackMethodOutput.description = null;
                // console.log("no descriptionn");
            }
            // console.log(attackedDevice);
            attackedDevice.setMethod(attackMethodOutput);
            // console.log(attackedDevice.attackMethod);
            // console.log(attackedDevice);
        };

        vm.checkshit = function () {
            console.log("shihshishi");
        };

        /* finish the whole query information create a new objectet*/
        vm.finish = function (index) {
            // var bool = (vm.attackTarget.length-index);
            console.log(index);
            var deviceArray = [];
            console.log(index);
            console.log(vm.attackTarget.length);

            // console.log(attackedDevice);
            if (!vm.selectedResult) {
                vm.selectedResult = null;
            }

            attackedDevice.setResult(vm.selectedResult);
            // console.log(attackedDevice);

            attackedDevice.updateAttackedDevice();

            for (var i = 0; i < vm.attackDevice.length; i++) {
                deviceArray.push(vm.attackDevice[i].nodeId);
            }

            // if (bool!==1) {

            // } else {

            // }

            //console.log(vm.editSelectedDevice);
            //console.log(passdata2);
            //console.log($scope.uploader);
            //console.log(attackedDevice.attackMethod);
            //console.log((vm.attackTarget.length- 1 - index));
            //console.log($scope.currentPath.pathId);

            if (vm.attackTarget.length - 1 - index <= 0) {
                console.log("new");
                var passdata = {
                    "targetName": vm.deviceSelectedName,
                    "queryConditions": "",
                    "selectedTarget": attackedDevice.selectedId,
                    "selectedTargetList": deviceArray,
                    "attackMethod": attackedDevice.attackMethod.method,
                    "customDescription": attackedDevice.attackMethod.description,
                    "description": vm.selectedResult,
                    "targetOrder": index + 1,
                    "createdAt": new Date()
                };
                Attack.createAttackTarget($scope.currentPath.pathId, passdata).then(function (target) {
                    console.log(target.data);
                    vm.attackTarget.splice(-1, 1);
                    vm.attackTarget.push(target.data);
                    vm.createAttackTarget();
                    for (var i = 0; i < $scope.uploader.array.length; i++) {
                        uploadFiles(target.data.targetId, $scope.uploader.array[i]);
                    }
                });
            } else {
                //console.log(attackedDevice.selectedId);
                var passdata2 = {
                    "targetId": vm.editTargetId,
                    "targetName": vm.deviceSelectedName,
                    "queryConditions": "",
                    "selectedTarget": vm.selectedTarget,
                    "selectedTargetList": deviceArray,
                    "attackMethod": vm.selectedMethod,
                    "customDescription": vm.selectedDescription,
                    "description": vm.selectedResult
                };

                Attack.editAttackTarget($scope.currentPath.pathId, vm.editTargetId, passdata2).then(function (target) {
                    for (var j = 0; j < vm.attackTarget.length; j++) {
                        var tmp = vm.attackTarget[j];
                        if (tmp.targetId === target.data.targetId) {
                            vm.attackTarget[j].targetName = target.data.targetName;
                        }
                    }
                    for (var i = 0; i < $scope.uploader.array.length; i++) {
                        uploadFiles(target.data.targetId, $scope.uploader.array[i]);
                    }
                });

            }

            // if(bool===1){
            //     /* 新建攻击目标 */
            //     vm.attackTarget.splice(-1,1);
            //     vm.attackTarget.push(attackedDevice);
            //     vm.createAttackTarget();

            //     console.log(attackedDevice);

            // } else {
            //     vm.attackTarget.splice(index,1,attackedDevice);
            //     attackedDevice = new AttackedDevice();
            //     console.log('123123');
            // }

            // console.log(vm.attackTarget);
            console.log("finished Targeting!");


            // console.log(vm.attackTarget.length);


            /* CALL BACK    clear gabage*/

        };

        $rootScope.$on('delete-file', function (event, data) {
            console.log(data);
            vm.attackAttachedFile.splice(data, 1);
            console.log(vm.attackAttachedFile);
        });

        vm.closeAlert = function (index) {
            vm.alerts.splice(index, 1);
        };

        vm.createAttackTarget();
        vm.getAllPath(0);
        // vm.target();
        vm.relation();
        vm.setAttackMethod();

        // console.log(vm.attackTarget);

        function uploadFiles(targetId, element) {
            Attack.uploadMultipleFiles(targetId, element).then(function (data) {
                console.log(data.data);
            }, function (data) {
                console.log(data);
                $rootScope.addAlert({
                    type: 'danger',
                    content: data.data.error
                });
            });
        }

        vm.tried = function () {
            // console.log(vm.attackTarget);
        };
    }

})();
