/**
 * Created by Morgan on 14-12-20.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Task', TaskModel);

    function TaskModel($http, URI) {
        var taskurl = URI;

        var service = {
            getTask: getTask
        };
        return service;

        //////////

        function getTask(taskId) {
            return $http.get(taskurl + '/tasks/' + taskId);
        }


    }

})();
