/**
 * Todo List Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.todolist')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('todolist', {
            parent: 'dashboard',
            url: '/todolist',
            templateUrl: 'templates/todolist/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'MY_ACCOUNT';
                }
            }
        });
    }
})();
