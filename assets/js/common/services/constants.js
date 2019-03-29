/**
 * constants service
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('constantService', constantService);

    function constantService() {
        return {
            'passwordComplexity': [
                {
                    'name': '低',
                    'message': '任意字母、数字或字符，8位或以上，25位以下'
                }, {
                    'name': '中',
                    'message': '必须是字母加数字和符号，8位或以上，25位以下'
                }, {
                    'name': '高',
                    'message': '必须是字母加数字和符号，12位或以上，25位以下'
                }
            ],
        };
    }
})();
