/**
 * Monitor Event Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.incident')
        .controller('IncidentCtrl', ['$timeout', '$scope', '$q', 'Incident',IncidentCtrl])
        .controller('IncidentDetailCtrl', ['detail',IncidentDetailCtrl]);


    function IncidentCtrl($timeout, $scope, $q, Incident) {
        var vm = this;
        vm.shouldFlashEvent = false;
        vm.shouldFlashIncident = false;
        vm.notInitTodayCount = true;
        vm.notInitIncidentCount = true;
        vm.notInitPeakHour = true;
        vm.notInitErrorCount = true;

        Incident.getTodayIncidentCount().then(function (todayCount) {
            vm.todayCount = todayCount;
            vm.notInitTodayCount = false;
        });

        //$q.all([Incident.getUnreadIncidentCount(), Incident.getUnreadStrategyCount()]).then(function (d) {
        //    vm.unReadIncidentCount = d[0];
        //    vm.unReadStrategyCount = d[1];
        //    vm.unReadTotalCount = d[0] + d[1];
        //    vm.notInitIncidentCount = false;
        //});

        Incident.getUnreadIncidentCount().then(function (incidentCount) {
            vm.unReadIncidentCount = incidentCount;
            vm.notInitIncidentCount = false;
        });


        Incident.getPeakHour().then(function (peakHour) {
            vm.peakHour = peakHour;
            vm.notInitPeakHour = false;
        });

        Incident.getErrorCount().then(function (errorCount) {
            vm.errorIncidentCount = errorCount;
            vm.notInitErrorCount = false;
        });

        vm.defaultTab = "incident";

        vm.clickIncRow = function (inc) {
            if (inc.status === 'NEW') {
                Incident.updateIncidentStatus(inc.incidentId);
                inc.status = 'READ';
                vm.unReadIncidentCount--;
            }
        };

        $scope.$on('newIncidentInsert', function () {
            if (vm.showRefreshConfirmation) {
                $timeout(function () {
                    vm.shouldFlashIncident = true;
                }, 2000);
            } else {
                vm.shouldFlashIncident = true;
            }
        });

        vm.showRefreshMessage = function () {
            vm.showRefreshConfirmation = true;
            $timeout(function () {
                vm.showRefreshConfirmation = false;
            }, 2000);
        };

        vm.getAllCounts = function () {
            vm.notInitTodayCount = true;
            vm.notInitIncidentCount = true;
            vm.notInitPeakHour = true;
            vm.notInitErrorCount = true;

            $q.all([
                Incident.getTodayIncidentCount(),
                Incident.getUnreadIncidentCount(),
                Incident.getPeakHour(),
                Incident.getErrorCount()
            ]).then(function (d) {
                vm.todayCount = d[0];
                vm.notInitTodayCount = false;
                vm.unReadIncidentCount = d[1];
                vm.notInitIncidentCount = false;
                vm.peakHour = d[2];
                vm.notInitPeakHour = false;
                vm.errorIncidentCount = d[3];
                vm.notInitErrorCount = false;
            });
        };

        vm.refreshCounts = function (){
            if(vm.shouldFlashIncident === true){
                vm.getAllCounts();
            }
        };
    }

    function IncidentDetailCtrl(detail) {
        var vm = this;
        vm.incident = detail.incident;
        if (vm.incident && vm.incident.packet) {
            vm.incident.packet.hb_sliced = vm.incident.packet.hb && Array.isArray(vm.incident.packet.hb) ? vm.incident.packet.hb.slice(0, 57) : [];
        }

        vm.nodes = detail.nodes;
        vm.expend = false;
        /*
         function ModalInstanceCtrl($scope, $modalInstance, incident, action) {
         var newAction = action;
         $scope.isError = false;
         Template.getSimilarEvent(topologyId, incident.incidentId).then(function (data) {
         $scope.policyBlock = data;
         $scope.policyBlock.rules[0].action = action;
         $scope.policyBlock.rules.forEach(function (rule, index) {
         if (index !== 0) {
         rule.disabled = true;
         }
         });
         }, function (data) {
         $scope.isError = true;
         $scope.error = data.data;
         });

         $scope.changeRiskLevel = function (index, lv) {
         $scope.policyBlock.rules[index].riskLevel = lv;
         };

         $scope.changeAction = function (index, action) {
         $scope.policyBlock.rules[index].action = action;
         newAction = action;
         };

         $scope.ok = function () {
         //console.log("ok");
         $modalInstance.close(newAction);
         };

         $scope.cancel = function () {
         $modalInstance.dismiss('cancel');
         };
         }

         vm.confirmChangeAction = function (incident, action) {
         if (action === detail.incident.action) {
         return;
         } else {
         var modalInstance = $modal.open({
         templateUrl: '/templates/monitor/event/confirmChangeAction.html',
         controller: ModalInstanceCtrl,
         size: 'sm',
         resolve: {
         incident: function () {
         return incident;
         },
         action: function () {
         return action;
         }
         }
         });

         modalInstance.result.then(function (newAction) {
         var params = {};
         apiInfo.sysbaseinfo().then(function (data) {
         var date = new Date(data.data);
         var currentMonth = date.getMonth() + 1;
         var month = currentMonth < 10 ? '0' + currentMonth : currentMonth;
         var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
         var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
         var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
         var name = '未来相同事件转换规则-' + date.getFullYear() + '-' + month + '-' + day + '-' + hour + ':' + minutes;
         params.targetAction = newAction;
         params.policyName = name;

         Template.updateSimilarEvent(topologyId, incident.incidentId, params).then(function (data) {
         var taskId = data.taskId;
         var deferred = $q.defer();
         $rootScope.deployTaskPromise = deferred.promise;

         (function countdown(counter) {
         var checkDeploy = $timeout(function () {

         Task.getTask(taskId).then(function (data) {
         if (data.data.state === 'SUCCESS') {
         $rootScope.$broadcast('updateDashboardHeader');
         $rootScope.addAlert({
         type: 'success',
         content: '部署成功'
         });
         deferred.resolve('success');
         $timeout.cancel(checkDeploy);
         } else if (data.data.state === 'FAILED') {
         $rootScope.addAlert({
         type: 'danger',
         content: (data.data.reason ? ('部署失败：' + data.data.reason) : '部署失败')
         });
         deferred.resolve('fail');
         $timeout.cancel(checkDeploy);
         } else if (counter > 0) {
         countdown(counter - 1);
         } else {
         deferred.resolve('timeout');
         $rootScope.addAlert({
         type: 'danger',
         content: '部署超时'
         });
         }
         });
         }, 1000);
         })(120);
         });
         });
         }, function () {
         console.log('Modal dismissed at: ' + new Date());
         });
         }
         };
         */
    }
})();
