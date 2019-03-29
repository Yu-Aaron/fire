/**
 * Switch config Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular.module('southWest.setting.switch').controller('SwitchCtrl', SwitchCtrl);

    function SwitchCtrl($rootScope, SwitchModel, $modal, $q) {
        //var vm = this;
        var vm = this;

        //------------------ traffic switch config begin --------------------
        vm.isEditingTraffic = false;
        vm.loadTrafficSwitch = function () {
            SwitchModel.getTrafficSwitch().then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    if (d.subscriptionType === "IP_TRAFFIC") {
                        vm.iptrafficReport = d.subscriptionStatus === "ON_ALARM" ? 1 : 0;
                        break;
                    }
                }
            });
        };
        vm.loadTrafficSwitch();

        vm.editTraffic = function () {
            vm.isEditingTraffic = !vm.isEditingTraffic;
        };
        vm.cancelTraffic = function () {
            vm.isEditingTraffic = !vm.isEditingTraffic;
            vm.loadTrafficSwitch();
        };
        vm.confirmTraffic = function () {
            $modal.open({
                templateUrl: 'templates/setting/switch/switch-setting-confirm.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });
            function ModalInstanceCtrl($scope, $modalInstance) {
                $scope.confirmTitle = "流量开关";
                $scope.ok = function () {
                    $modalInstance.close('done');
                    var params = {"iptrafficReport": vm.iptrafficReport};
                    var deferred = $q.defer();
                    $rootScope.timeoutPromise = deferred.promise;
                    SwitchModel.setTrafficSwitch(params).then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '流量开关下发成功'
                        });
                        vm.isEditingTraffic = false;
                    }, function (data) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.reason ? ('流量开关下发失败：' + data.data.reason) :
                                data.data.rejectReason ? ('流量开关下发失败：' + data.data.rejectReason) : '流量开关下发失败')
                        });
                    });
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                    vm.cancelTraffic();
                };
            }
        };
        //------------------ traffic switch config end --------------------

        //------------------ audit protocol switch config begin --------------------
        //数控审计保护协议配置
        vm.isEditingDP = false;
        vm.loadAuditProtocolSwitch = function () {
            SwitchModel.getProtocolSwitch().then(function (data) {
                vm.DPprotocols = data;
            });
        };
        vm.loadAuditProtocolSwitch();

        vm.enableAllDP = function () {
            vm.DPprotocols.map(function (dpp) {
                dpp.status = true;
            });
        };
        vm.disableAllDP = function () {
            vm.DPprotocols.map(function (dpp) {
                dpp.status = false;
            });
        };
        vm.editDP = function () {
            vm.oldDPprotocols = angular.copy(vm.DPprotocols);
            vm.isEditingDP = true;
        };
        vm.cancelDP = function () {
            vm.DPprotocols = vm.oldDPprotocols;
            vm.isEditingDP = false;
        };
        vm.showConfirm = function () {
            $modal.open({
                templateUrl: 'templates/setting/switch/switch-setting-confirm.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });

            function ModalInstanceCtrl($scope, $modalInstance) {
                $scope.confirmTitle = "协议审计开关";
                $scope.ok = function () {
                    vm.confirmDP();
                    $modalInstance.close('done');
                };

                $scope.cancel = function () {
                    vm.cancelDP();
                    $modalInstance.dismiss('cancel');
                };
            }
        };

        vm.confirmDP = function () {
            var i64Value = "0";
            for (var i = vm.DPprotocols.length - 1; i >= 0; i--) {
                i64Value += (vm.DPprotocols[i].status ? 1 : 0);
            }
            i64Value = parseInt(i64Value, 2);
            var params = {icAccountingReport1: i64Value};

            var deferred = $q.defer();
            $rootScope.timeoutPromise = deferred.promise;
            SwitchModel.setProtocolSwitch(params).then(function () {
                deferred.resolve('success');
                $rootScope.addAlert({
                    type: 'success',
                    content: '协议审计开关下发成功'
                });
                vm.isEditingDP = false;
                vm.loadAuditProtocolSwitch();
            }, function (data) {
                deferred.resolve('fail');
                $rootScope.addAlert({
                    type: 'danger',
                    content: (data.data.reason ? ('协议审计开关下发失败：' + data.data.reason) :
                        data.data.rejectReason ? ('协议审计开关下发失败：' + data.data.rejectReason) : '协议审计开关下发失败')
                });
            });
        };
        //------------------ audit protocol switch config end --------------------
    }
})();
