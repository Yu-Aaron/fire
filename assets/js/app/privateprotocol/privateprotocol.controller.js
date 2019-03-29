/**
 * PrivateProtocol Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.privateprotocol')
        .controller('PrivateProtocolCtrl', PrivateProtocolCtrl);

    function PrivateProtocolCtrl($scope, $state, $rootScope, PrivateProtocol, protocols, hiddenPorts, $modal) {

        $scope.refresh = function () {
            $state.reload();
        };

        var vm = this;
        vm.protocols = protocols;
        vm.hiddenPorts = hiddenPorts;
        vm.noErrors = true;

        vm.edit = function () {
            vm.oldprotocols = angular.copy(vm.protocols);
            vm.isEditing = true;
        };

        vm.cancel = function () {
            vm.protocols = vm.oldprotocols;
            vm.isEditing = false;
        };

        vm.confirm = function () {
            PrivateProtocol.updateAll(vm.protocols).then(function () {
                vm.isEditing = false;
            }, function (error) {
                //console.log(vm.protocols);
                // For multiple errors
                // console.log(error.error);
                // for (var i in vm.protocols) {
                //   if (vm.protocols[i]) {
                //     for (var j in error.error) {
                //       if (vm.protocols[i].privateProtocolId === error.error[j].privateProtocolId) {
                //         if (error.error[j].message) {
                //           vm.protocols[i].message = error.error[j].message;
                //           break;
                //         }
                //       }
                //     }
                //   }
                // }
                // For sigle error
                //console.log(error);
                for (var i in vm.protocols) {
                    if (vm.protocols[i]) {
                        if (vm.protocols[i].privateProtocolId === error.privateProtocolId) {
                            if (error.info) {
                                vm.protocols[i].message = error.info;
                                break;
                            }
                        }
                    }
                }
            });
        };

        vm.showConfirmUI = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/privateprotocol/confirm-panel.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance) {
                $scope.msg = {
                    'text': '',
                    'list': '',
                    'qus': '确定所有修改？'
                };

                for (var i = 0; i < vm.protocols.length; i++) {
                    if (vm.oldprotocols[i].disabled === 0 && vm.protocols[i].disabled === 1) {
                        $scope.msg.text += ($scope.msg.text) ? ('') : ('请注意，关闭已经启用的私有协议会影响到引用过此私有协议的内容，包括：学习到的与此私有协议相关行为规则；引用此私有协议的手写规则；将来此事件的处理方式等。');
                        $scope.msg.list += ($scope.msg.list) ? (vm.oldprotocols[i].protocolName + '， ') : ('以下私有协议将被关闭: ' + vm.oldprotocols[i].protocolName + '， ');
                    }
                }

                $scope.cancel = function () {
                    vm.cancel();
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    vm.confirm();
                    $modalInstance.close('done');
                };
            }
        };

        vm.switch = function (protocol, status) {
            if (status === 0) {
                if (protocol.protocolPort && protocol.protocolPort.toString() === "-1") {
                    protocol.protocolPort = "";
                }
            }
            protocol.disabled = status;
            this.checkAllPorts();
        };

        vm.checkAllPorts = function () {
            clearErrors();
            var hasInvalid = checkInvalidPort();
            var hasDuplicates = checkDuplicatePort();
            var hasInUse = checkInUsePort();
            vm.noErrors = hasInvalid && hasDuplicates && hasInUse;
        };

        function clearErrors() {
            for (var i in vm.protocols) {
                if (vm.protocols[i]) {
                    vm.protocols[i].message = "";
                }
            }
        }

        function validatePort(port) {
            var num = +port;
            return num >= 1 && num <= 65535 && port === num.toString();
        }

        function checkInvalidPort() {
            var hasInvalid = false;
            for (var i in vm.protocols) {
                if (vm.protocols[i] && !vm.protocols[i].disabled) {
                    if (!vm.protocols[i].protocolPort || vm.protocols[i].protocolPort.length === 0) {
                        vm.protocols[i].message = "请输入端口码";
                        hasInvalid = true;
                    } else {
                        if (!validatePort(vm.protocols[i].protocolPort.toString())) {
                            vm.protocols[i].message = "请输入合法的端口码";
                            hasInvalid = true;
                        }
                    }
                }
            }
            return !hasInvalid;
        }

        function checkDuplicatePort() {
            var hasDuplicates = false;
            var i, j, n;
            n = vm.protocols.length;
            for (i = 0; i < n; i++) {
                if (vm.protocols[i].disabled || !vm.protocols[i].protocolPort || vm.protocols[i].protocolPort.length === 0) {
                    continue;
                }
                for (j = i + 1; j < n; j++) {
                    if (vm.protocols[j].disabled || !vm.protocols[j].protocolPort || vm.protocols[j].protocolPort.length === 0) {
                        continue;
                    }
                    if (vm.protocols[i].protocolPort.toString() === vm.protocols[j].protocolPort.toString()) {
                        vm.protocols[i].message = "重复";
                        vm.protocols[j].message = "重复";
                        hasDuplicates = true;
                    }
                }
            }
            return !hasDuplicates;
        }

        function checkInUsePort() {
            var hasInUse = false;
            for (var i in vm.protocols) {
                if (vm.protocols[i] && !vm.protocols[i].disabled) {
                    if (!vm.protocols[i].protocolPort || vm.protocols[i].protocolPort.length === 0) {
                        continue;
                    }
                    for (var j in vm.hiddenPorts) {
                        if (vm.hiddenPorts[j].toString() === vm.protocols[i].protocolPort.toString()) {
                            vm.protocols[i].message = vm.hiddenPorts[j] + "为网络端口，请输入其他端口码";
                            hasInUse = true;
                            break;
                        }
                    }
                }
            }
            return !hasInUse;
        }

    }

})();
