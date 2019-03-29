/**
 * MyAccount Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.myaccount')
        .controller('MyAccountCtrl', MyAccountCtrl);

    function MyAccountCtrl($rootScope, SystemUser, System, accountUsers, auth, uiCtrl, strategyInfo, constantService, passwordValidationService) {

        //username.onchange = function () {
        //  console.log('shit');
        //}
        var vm = this;

        $rootScope.currentState = "MY_ACCOUNT";

        vm.success = {
            show: false
        };
        vm.error = {
            showPassword: false,
            showConfirmPassword: false
        };

        if (auth.getUserName()) {
            delete vm.user;
            vm.user = accountUsers.users.filter(function (a) {
                return a.name === auth.getUserName();
            })[0];
            //Set for root user
            if (!vm.user && auth.getUserName() === 'root') {
                vm.user = {};
                vm.user.stuffName = 'root';
                vm.user.name = 'root';
            }
        } else {
            $rootScope.$on('username', function (e, u) {
                console.log(u);
                vm.user = u;
            });
        }

        // get password complexity strategy
        vm.passwordComplexityStrategy = passwordValidationService.getPassComplexity(strategyInfo.data);
        vm.passwordComplexityMessage = passwordValidationService.getPassComplexityMessage(vm.passwordComplexityStrategy.strategyRules[0].ruleData);
        vm.passwordErrormessages = passwordValidationService.errorMessages;

        vm.passwordValid = false;
        vm.validatePassword = function () {
            var ret = passwordValidationService.validatorWithOld(vm.user.oldPassword, vm.user.newPassword, vm.user.confirmNewPassword, vm.passwordComplexityStrategy.strategyRules[0].ruleData);
            vm.oldPassValid = ret.oldPassValid;
            vm.newPassValid = ret.newPassValid;
            vm.confirmPassValid = ret.confirmPassValid;
            vm.passwordValid = ret.allValid;
        };

        vm.changePassword = function () {
            vm.passwordValid = false;
            vm.error = {
                showPassword: false,
                showConfirmPassword: false
            };

            if (vm.user.newPassword === vm.user.confirmNewPassword) {
                SystemUser.updateMyPassword(vm.user.oldPassword, vm.user.newPassword).then(function (data) {
                    console.log(data);
                    //if (uiCtrl.isRemote()) {
                    //    System.syncDataToAllInOne().then(function () {
                    //    }, function (error) {
                    //        console.log(error.data.error);
                    //        $rootScope.addAlert({
                    //            type: 'danger',
                    //            content: '用户信息同步失败！'
                    //        });
                    //    });
                    //}
                    delete vm.user.oldPassword;
                    delete vm.user.newPassword;
                    delete vm.user.confirmNewPassword;
                    vm.oldPassValid = 0;
                    vm.newPassValid = 0;
                    vm.confirmPassValid = 0;
                    vm.error = {
                        showPassword: false,
                        showConfirmPassword: false
                    };
                    vm.success.show = true;
                    setTimeout(function () {
                        vm.success.show = false;
                    }, 3000);

                }, function (data) {
                    vm.error.showPassword = data.data.error !== '';
                    vm.error.message = data.data.error;
                    vm.validatePassword();
                    setTimeout(function () {
                        vm.error.showPassword = false;
                    }, 3000);
                });
            } else {
                vm.error.showConfirmPassword = true;
                vm.error.messageConfirm = "密码不一致";
            }
        };
    }

})();
