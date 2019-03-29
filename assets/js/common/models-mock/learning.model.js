/**
 * Created by Morgan on 14-12-02.
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Learning', LearningModel);

    function LearningModel($http, URI, topologyId) {
        var learningurl = URI;

        var service = {
            getTask: getTask,
            createLearningTask: createLearningTask,
            getLearningTasks: getLearningTasks,
            getTopologyLearningTasks: getTopologyLearningTasks,
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
            return $http.get(learningurl + '/learning/' + taskId);
        }

        function createLearningTask(schedule) {
            return $http.post(learningurl + '/learning/topology/' + topologyId.id + '/', schedule);
        }

        function getTopologyLearningTasks(topologyId) {
            return $http.get(learningurl + '/learning/topology/' + topologyId + '?$filter=state ne REJECTED&$orderby=startDatetime desc');
        }

        function getLearningTasks() {
            return $http.get(learningurl + '/learning?$filter=state ne REJECTED&$orderby=startDatetime desc');
        }

        function updateLearningTask(taskId, schedule) {
            return $http.put(learningurl + '/learning/' + taskId, schedule);
        }

        function removeLearningTask(taskId) {
            return $http.delete(learningurl + '/learning/' + taskId);
        }

        function pause(taskId) {
            return $http.put(learningurl + '/learning/' + taskId + '/pause');
        }

        function resume(taskId) {
            return $http.put(learningurl + '/learning/' + taskId + '/resume');
        }

        function stop(taskId) {
            return $http.put(learningurl + '/learning/' + taskId + '/stop');
        }

        function getLearningBlocksByPolicyId(policyId) {
            return $http.get(learningurl + '/policies/' + policyId + '/blocks?type=LEARN&&lockstatus=NODEPLOY');
        }

        function getLearningBlocksByRef(ref) {
            return $http.get(learningurl + ref);
        }

    }

})();
