/**
 * password validation service
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('passwordValidationService', passwordValidationService);

    function passwordValidationService(constantService) {
        return {
            'validatePassword': validatePassword,
            'validator': validator,
            'validatorWithOld': validatorWithOld,
            'getPassComplexity': getPassComplexity,
            'getPassComplexityMessage': getPassComplexityMessage,
            'errorMessages': {
                'oldPass': '当前密码不能为空',
                'newPass': '密码不符合规则',
                'confirmPass': '密码输入不一致',
            },
        };

        function validatePassword(input, complexity) {
            var paswd;
            if (complexity === '中') {
                paswd = /^(?=.*[0-9])(?=.*[!@#$%^&*_])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*_]{8,25}$/;
            } else if (complexity === "低") {
                paswd = /^[a-zA-Z0-9!@#$%^&*_]{8,25}$/;
            } else {
                paswd = /^(?=.*[0-9])(?=.*[!@#$%^&*_])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*_]{12,25}$/;
            }
            if (input.match(paswd)) {
                return true;
            } else {
                return false;
            }
        }

        function validatorWithOld(oldPassword, newPassword, confirmPassword, complexity) {
            var ret = {
                oldPassValid: 0,
                newPassValid: 0,
                confirmPassValid: 0,
                allValid: false,
            };
            if (oldPassword) {
                ret.oldPassValid = 2;
            }
            if (newPassword) {
                if (validatePassword(newPassword, complexity)) {
                    ret.newPassValid = 2;
                } else {
                    ret.newPassValid = 1;
                }
            }
            if (ret.newPassValid === 2) {
                if (newPassword === confirmPassword) {
                    ret.confirmPassValid = 2;
                } else {
                    ret.confirmPassValid = 1;
                }
            }
            if (ret.oldPassValid === 2 && ret.newPassValid === 2 && ret.confirmPassValid === 2) {
                ret.allValid = true;
            }
            return ret;
        }

        function validator(newPassword, confirmPassword, complexity) {
            var ret = {
                newPassValid: 0,
                confirmPassValid: 0,
                allValid: false,
            };
            if (newPassword) {
                if (validatePassword(newPassword, complexity)) {
                    ret.newPassValid = 2;
                } else {
                    ret.newPassValid = 1;
                }
            }
            if (ret.newPassValid === 2) {
                if (newPassword === confirmPassword) {
                    ret.confirmPassValid = 2;
                } else {
                    ret.confirmPassValid = 1;
                }
            }
            if (ret.newPassValid === 2 && ret.confirmPassValid === 2) {
                ret.allValid = true;
            }
            return ret;
        }

        function getPassComplexity(strategyData) {
            for (var i = 0; i < strategyData.length; i++) {
                if (strategyData[i].strategyInfo.strategyCode === "PASSWORD_COMPLEXITY_MANAGEMENT") {
                    return strategyData[i];
                }
            }
            return false;
        }

        function getPassComplexityMessage(ruleData) {
            for (var i = 0; i < constantService.passwordComplexity.length; i++) {
                var tmp = constantService.passwordComplexity[i];
                if (tmp.name === ruleData) {
                    return tmp.message;
                }
            }
            return "";
        }
    }
})();
