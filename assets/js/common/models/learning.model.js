/**
 * Created by Morgan on 14-12-02.
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Learning', LearningModel);

    function LearningModel($http, URI, topologyId, $rootScope, UCD) {
        var learningurl = URI;

        var service = {
            getTask: getTask,
            getTaskMac: getTaskMac,
            setTaskMac: setTaskMac,
            createLearningTask: createLearningTask,
            createLearningTaskAll: createLearningTaskAll,
            getLearningTasks: getLearningTasks,
            updateLearningTask: updateLearningTask,
            removeLearningTask: removeLearningTask,
            pause: pause,
            resume: resume,
            stop: stop,
            getLearningBlocksByPolicyId: getLearningBlocksByPolicyId,
            getLearningBlocksByRef: getLearningBlocksByRef
        };
        return service;

        //////////

        function getTask(taskId) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + learningurl + '/learning/' + taskId);
        }

        function getTaskMac(taskId) {
            return $http.get(learningurl + '/policies/task/' + taskId + '/learnedipmac');
        }

        function setTaskMac(data) {
            return $http.put(learningurl + '/policies/learnedipmac', data);
        }

        function createLearningTask(schedule, ip) {
            return $http.post(UCD.getUrl(ip || $rootScope.currentIp) + learningurl + '/learning/createLearningTask/', schedule);
        }

        function createLearningTaskAll(schedule) {
            return $http.post(learningurl + '/learning/all', schedule);
        }

        function getLearningTasks(ip) {
            return $http.get(UCD.getUrl(ip || $rootScope.currentIp) + learningurl + '/learning/getLearningTasksByfilter?$filter=state ne REJECTED&$orderby=startDatetime desc');
        }

        function updateLearningTask(taskId, schedule) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + learningurl + '/learning/' + taskId, schedule);
        }

        function removeLearningTask(taskId) {
            return $http.delete(UCD.getUrl($rootScope.currentIp) + learningurl + '/learning/' + taskId);
        }

        function pause(taskId) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + learningurl + '/learning/' + taskId + '/pause');
        }

        function resume(taskId) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + learningurl + '/learning/' + taskId + '/resume');
        }

        function stop(taskId) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + learningurl + '/learning/' + taskId + '/stop');
        }

        function getLearningBlocksByPolicyId(policyId) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + learningurl + '/policies/' + policyId + '/blocks?type=LEARN&&lockstatus=NODEPLOY');
        }

        function getLearningBlocksByRef(ref) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + learningurl + ref);
        }

    }

})();
