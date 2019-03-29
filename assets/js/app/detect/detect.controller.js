/*

 detect.controller

 */
(function () {
    'use strict';

    angular
        .module('southWest.detect')
        .controller('DetectCtrl', DetectCtrl);

    function DetectCtrl($scope, Topology, Detect, topologyId, FileUploader, Signature, URI, $rootScope, $state, $q, $modal, $filter, uiCtrl, uiTree, intrusionDetectionId, $timeout, vulnerabilityCount, $stateParams, $interval, auth, Enum, leftNavCustomMenu) {
        if (!topologyId.id) {
            topologyId.id = 0;
        }

        $scope.PatternDetailPanel = false;
        $scope.showNotification = false;
        var deferred = $q.defer();
        $scope.offlineDeferred = {};
        var onlineIndex = intrusionDetectionId[0].detectionType === 'REALTIME' ? 0 : 1;
        var offlineIndex = intrusionDetectionId[0].detectionType === 'OFFLINE' ? 0 : 1;

        var onlineId = intrusionDetectionId[onlineIndex].intrusionDetectionId;
        var offlineId = intrusionDetectionId[offlineIndex].intrusionDetectionId;

        var offlineMode = true;
        var intrusionId = offlineMode ? offlineId : onlineId;
        var subscribed = false;
        var maxFlowDataTimeStamp = 0;

        var loopPattern;

        var vm = this;
        vm.fileUploaded = intrusionDetectionId[offlineIndex].fileUploaded;
        vm.lastOffLineUpdate = new Date(intrusionDetectionId[offlineIndex].updatedAt);
        vm.lastOffLineUpdate = moment(vm.lastOffLineUpdate).format("YYYY-MM-DD HH:mm:ss");
        vm.showGraph = false;
        vm.inUse = intrusionDetectionId[onlineIndex].inUse;
        vm.inUseOffline = intrusionDetectionId[offlineIndex].inUse;
        vm.noVulnerability = false;

        vm.lv2MenuEnabledByTarget = leftNavCustomMenu.lv2MenuEnabledByTarget;

        $scope.pv = Enum.get('privilege').filter(function (a) {
            return a.name === $rootScope.currentState;
        })[0].actionValue;
        vm.canEdit = (($scope.pv & 4) > 0);

        vm.noBlackListWarning = true;
        Signature.getDeployedPolicy('BLACKLIST').then(function (data) {
            vm.BlackListDeployed = data.data.length > 0;
        });

        if (offlineMode && vm.showGraph && !vm.inUseOffline) {
            //Detect.lowlevelactor(topologyId.id, intrusionId);
            console.log();
        } else {
            Detect.initialstate(topologyId.id, intrusionId).then(function (data) {
                vm.showRealtimeGraph = data;
            });
        }

        if (vulnerabilityCount === 0) {
            var modalInstance = $modal.open({
                backdrop: 'static',
                //keyboard: false,
                templateUrl: 'redirect.html',
                controller: function ($scope, $modalInstance) {
                    $scope.ok = function () {
                        $modalInstance.close('ok');
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                window.history.back();
            }, function () {
                window.history.back();
            });
        } else if ($rootScope.redWarning) {
            portStatus(null, $rootScope.redWarning);
        } else if (!offlineMode) {
            queryPattern();
            startQueryPattern();
            subscribeSSE();
        }

        if (!offlineMode) {
            // eth1 Status
            $rootScope.$$listeners['portStatus'] = [];
            $rootScope.$on('portStatus', function (event, data) {
                portStatus(event, data);
            });
        }

        $scope.$on('$destroy', function () {
            unscribeSSE();
        });

        vm.startOffLine = function () {
            subscribeSSE();
        };

        vm.uiEnable = function (description, lv) {
            return uiCtrl.isShow(description, lv);
        };

        function startQueryPattern() {
            loopPattern = $interval(queryPattern, 10000);
            $scope.$on('$destroy', function () {
                $interval.cancel(loopPattern);
            });
        }

        function cancelQueryPattern() {
            $interval.cancel(loopPattern);
        }

        function unscribeSSE() {
            if (subscribed) {
                // sse.unsubscribe((offlineMode ? 'offlineIntrusionIncident' : 'realTimeIntrusionIncident'));
                // sse.unsubscribe((offlineMode ? 'offlineIntrusionFlowdata' : 'realTimeIntrusionFlowdata'));
                // sse.unsubscribe('intrusionDetection');
                vm.intrusionDetectionHandler();
                vm.startDetectionHandler();
            }
            subscribed = false;
        }

        function subscribeSSE() {
            if (!subscribed) {
                vm.intrusionDetectionHandler = $rootScope.$on('intrusionDetection', function (event, data) {
                    //sse.listen('intrusionDetection', $scope, function (data) {
                    vm.noVulnerability = false;
                    if ((data.type === 'realTimeDetection') && data.detectionState === "STARTED") {
                        if ($scope.chart) {
                            $scope.chart.series[0].setData([]);
                            $scope.chart.series[1].setData([]);
                            $scope.chart.series[2].setData([]);
                        }
                        vm.showStopNotification = false;
                        vm.inUse = true;
                        $scope.detectionStarted();
                    } else if (data.type === 'realTimeDetection' && data.detectionState === "COMPLETE") {
                        vm.inUse = false;
                        vm.makeStopNotification(data.content.userName);
                    } else if (data.type === 'realTimeIntrusionFlowdata' && data.detectionState === "PROCESSING") {
                        vm.inUse = true;
                    }

                    if ((data.type === 'offlineIntrusionIncident' && offlineMode) || (data.type === 'realTimeIntrusionIncident' && !offlineMode)) {
                        incident(data.content);
                    } else if ((data.type === 'offlineIntrusionFlowdata' && offlineMode) || (data.type === 'realTimeIntrusionFlowdata' && !offlineMode)) {
                        flowdata(data.content);
                    } else {
                        if (data.type === 'offlineDetection' && data.detectionState === 'COMPLETE') {
                            vm.inUseOffline = false;
                            if ($scope.offlineDeferred.promise) {
                                $scope.offlineDeferred.resolve();
                                $scope.chart.redraw();
                            }
                            var params = {
                                '$filter': 'intrusionDetectionId eq \'' + intrusionId + '\''
                            };
                            Detect.getPatternTableCount(topologyId.id, params).then(function (data) {
                                if (data === 0) {
                                    vm.noVulnerability = true;
                                }
                            });
                            unscribeSSE();
                            queryPattern();
                            cancelQueryPattern();
                        }
                    }
                });
                var startOfflineAnalyze = function () {
                    if (offlineMode && vm.showGraph) {
                        $scope.offlineDeferred = $q.defer();
                        $scope.offlinePromise = $scope.offlineDeferred.promise;
                        if ($rootScope.startOfflineAnalyze) {
                            $rootScope.startOfflineAnalyze = false;
                            var payload = {};
                            payload.intrusionDetectionId = offlineId;
                            payload.detectionType = 'OFFLINE';
                            Detect.startAnalyze(topologyId.id, payload);
                        } else if (!vm.inUseOffline && offlineMode) {
                            Detect.lowlevelactor(topologyId.id, intrusionId);
                        }
                    }
                };
                if ($rootScope.sseUpdateConnected) {
                    startOfflineAnalyze();
                }
                vm.startDetectionHandler = $rootScope.$on('sseUpdateConnected', function () {
                    startOfflineAnalyze();
                });

                subscribed = true;
            }
        }

        function incident(data) {
            var queue = [];
            deferred.resolve('success');

            data.forEach(function (p) {
                //  If flow data is not available yet, queue incident
                if (p.x > maxFlowDataTimeStamp) {
                    queue.push(p);
                } else {
                    $scope.chart.series[1].addPoint(p);
                }
            });
            queryPattern();

            //  wait 2s and push data to graph again
            if (queue.length > 0) {
                $timeout(function () {
                    incident(queue);
                }, 3000);
            }
        }

        function flowdata(data) {
            deferred.resolve('success');
            data.forEach(function (p) {
                if ($scope.chart && $scope.chart.series && $scope.chart.series[0]) {
                    if (offlineMode) {
                        $scope.chart.series[0].addPoint(p, vm.inUseOffline);
                    } else {
                        $scope.chart.series[0].addPoint(p);
                    }
                    if (p[0] > maxFlowDataTimeStamp) {
                        maxFlowDataTimeStamp = p[0];
                    }
                }
            });
        }

        function portStatus(event, data) {
            if (data === 'ERROR') {
                $scope.showNotification = true;
                $scope.eth1Error = true;
                $scope.eth1Down = false;
                deferred.resolve('eth1 error');
                deferred = $q.defer();
                unscribeSSE();
            } else if (data === 'DOWN') {
                $scope.showNotification = true;
                $scope.eth1Error = false;
                $scope.eth1Down = true;
                deferred.resolve('eth1 down');
                deferred = $q.defer();
                unscribeSSE();
            } else {
                $scope.waitingSSEPromise = deferred.promise;
                $scope.showNotification = false;
                $scope.eth1Error = false;
                $scope.eth1Down = false;
                if ($state.params.panel === 'online') {
                    subscribeSSE();
                }
                if (!vm.inUse) {
                    deferred.resolve('online not in use');
                }
            }
        }

        //  Generate graph configurations
        if (offlineMode) {
            $scope.graphConfigOffline = Detect.graph2('offline', $scope);
        } else {
            if (vm.inUse) {
                $scope.waitingSSEPromise = deferred.promise;
                if (vulnerabilityCount === 0 || $rootScope.redWarning) {
                    deferred.resolve('no vulnerability database');
                    deferred = $q.defer();
                }
            }


            var startTime = new Date(intrusionDetectionId[onlineIndex].startTime);
            if (isNaN(startTime)) {
                $scope.graphConfigOnline = Detect.graph2('online', $scope, $filter('date')(new Date(), 'medium'));
            } else {
                $scope.graphConfigOnline = Detect.graph2('online', $scope, $filter('date')(startTime, 'medium'));
            }
        }

        $scope.stopDetect = function () {
            var modalInstance = $modal.open({
                templateUrl: 'stopDetectConfirm.html',
                controller: function ($scope, $modalInstance) {
                    $scope.ok = function () {
                        $modalInstance.close('ok');
                        console.log('stop detect');
                        var payload = {};
                        payload.intrusionDetectionId = onlineId;
                        payload.detectionType = 'REALTIME';
                        payload.userName = auth.getUserName();
                        Detect.stopAnalyze(topologyId.id, payload).then(function (data) {
                            console.log(data);
                            //vm.inUse = false;
                            //vm.makeStopNotification();
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: 'sm'
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.startDetect = function (callback) {
            console.log('start detect');
            //  Notify MW to start processing
            var payload = {};
            payload.intrusionDetectionId = onlineId;
            payload.detectionType = 'REALTIME';
            Detect.startAnalyze(topologyId.id, payload).then(function () {
                //console.log(data);
                vm.inUse = true;
                vm.showStopNotification = false;
                if (callback) {
                    callback();
                }
            });
        };

        $scope.detectionStarted = function () {
            Detect.getId(topologyId.id).then(function (data) {
                intrusionDetectionId = data;
                if (data[0].detectionType === "REALTIME") {
                    $scope.graphConfigOnline = Detect.graph2('online', $scope, $filter('date')(new Date(data[0].startTime), 'medium'));
                } else {
                    $scope.graphConfigOnline = Detect.graph2('online', $scope, $filter('date')(new Date(data[1].startTime), 'medium'));
                }
            });
        };

        $scope.startRealtimeDetect = function () {
            $scope.startDetect(function () {
                vm.showRealtimeGraph = true;
            });
        };

        //  Call get pattern every 10s to keep engine running

        function queryPattern() {
            Detect.getPattern(topologyId.id, intrusionId).then(function (data) {
                $scope.intrusionPattern = data;
            });
        }

        var uploader = vm.uploader = new FileUploader({
            url: URI + '/files/topology/' + topologyId.id + '/' + offlineId + '/pcapupload',
            autoUpload: false,
            queueLimit: 1,
            filters: [{
                fn: function (file) {
                    if (file.name.split('.').pop() !== 'pcap') {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: file.name + '不是pcap文件！'
                        });
                        return false;
                    }
                    return true;
                }
            }]
        });

        var once = false;

        vm.makeStopNotification = function (usr) {
            if (intrusionDetectionId[onlineIndex].userName) {
                $scope.ppl = " " + intrusionDetectionId[onlineIndex].userName + " ";
            }

            if (usr) {
                $scope.ppl = " " + usr + " ";
            }

            vm.showStopNotification = true;
        };

        vm.makeStopNotification();

        (function initialStopNotification() {
            if (!vm.inUse) {
                vm.showStopNotification = true;
            } else {
                vm.showStopNotification = false;
            }
        })();

        uploader.onAfterAddingFile = function (fileItem) {
            Detect.deletePcap(topologyId.id, intrusionId).then(function () {
                if (!once) {
                    $scope.open(uploader);
                    once = true;
                }
                fileItem.upload();
            });
        };

        vm.goBack = function () {
            $state.go('detect', {panel: 'offline'});
        };

        $scope.showPatternDetail = function (signatureId) {
            $scope.signatureId = signatureId;
            $scope.currentPage = {value: 1}; //current page
            $scope.numPerPage = 10; //max rows for data table

            var payload = {
                '$skip': ($scope.currentPage.value - 1) * $scope.numPerPage,
                '$limit': $scope.numPerPage,
                '$orderby': 'timestamp desc',
                '$filter': 'intrusionDetectionId eq \'' + intrusionId + '\' and signatureId eq ' + signatureId
            };

            var params = {
                '$filter': 'intrusionDetectionId eq \'' + intrusionId + '\' and signatureId eq ' + signatureId
            };

            var promises = [];
            promises.push(Detect.getPatternDetail(topologyId.id, intrusionId, signatureId));
            promises.push(Detect.getPatternTable(topologyId.id, payload));
            promises.push(Detect.getPatternTableCount(topologyId.id, params));

            $q.all(promises).then(function (data) {
                $scope.patternDetail = data[0];
                $scope.patternTable = data[1];
                $scope.totalNum = data[2];
                $scope.PatternDetailPanel = true;
                var timestamp = new Date().getTime();
                $('#touch-logo').attr('src', 'images/exact-touchid-logo-animation.gif' + '?' + timestamp);
            });
        };

        $scope.pageChanged = function () {
            var payload = {
                '$skip': ($scope.currentPage.value - 1) * $scope.numPerPage,
                '$limit': $scope.numPerPage,
                '$orderby': 'timestamp desc',
                '$filter': 'intrusionDetectionId eq \'' + intrusionId + '\' and signatureId eq ' + $scope.signatureId
            };

            Detect.getPatternTable(topologyId.id, payload).then(function (data) {
                $scope.patternTable = data;
            });
        };

        $scope.goBack = function () {
            $scope.PatternDetailPanel = false;
        };

        $scope.open = function (uploader) {
            var modalInstance = $modal.open({
                templateUrl: 'templates/detect/offlinePopup.html',
                controller: ModalInstanceCtrl,
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    uploader: function () {
                        return uploader;
                    },
                    offlineId: function () {
                        return offlineId;
                    }
                }
            });

            modalInstance.result.then(function () {
                once = false;
                uploader.clearQueue();
                $rootScope.startOfflineAnalyze = true;
                vm.showGraph = true;
                vm.startOffLine();
                vm.inUseOffline = true;
                // $state.reload();
            }, function () {
                once = false;
                uploader.clearQueue();
            });
        };

        $scope.showDetail = function (intrusionIncidentId) {
            var modalInstance = $modal.open({
                templateUrl: 'templates/detect/pattern/detail.html',
                controller: function ($scope, $modalInstance, detail) {
                    $scope.detail = detail;
                    $scope.ok = function () {
                        $modalInstance.close('ok');
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    detail: function () {
                        return Detect.getIncidentDetail(topologyId.id, intrusionIncidentId);
                    }
                }
            });
            modalInstance.result.then(function () {
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
    }

    function ModalInstanceCtrl($scope, $modalInstance, uploader, $interval, SystemUser) {
        $scope.uploader = uploader;
        $scope.uploading = false;

        // When starting upload files, refresh user token every 20 seconds
        // until all files are uploaded or the dialog is cloesed.
        var loopRefreshToken = $interval(refreshToken, 20000);
        $scope.$on('$destroy', function () {
            if (loopRefreshToken) {
                $interval.cancel(loopRefreshToken);
            }
        });

        $scope.startAnalyze = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        uploader.onProgressAll = function () {
            $scope.uploading = true;
        };

        function refreshToken() {
            SystemUser.userToken();
        }

        uploader.onCompleteAll = function () {
            $scope.uploading = false;
            if (loopRefreshToken) {
                $interval.cancel(loopRefreshToken);
            }
        };
    }
})();
