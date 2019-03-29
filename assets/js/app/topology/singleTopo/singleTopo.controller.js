/**
 * Created by Morgan on 14-11-12.
 */
(function () {
    'use strict';

    angular
        .module('southWest.topology.singleTopo')
        .controller('singleTopoCtrl', TopologyCtrl);


    function TopologyCtrl($scope, $state, $rootScope, $q, URI, uiCtrl, FileUploader, topologyId, userRole, devices) {
        $scope.topo = $state.params.topo;
        $scope.userRole = userRole;
        $scope.devices = devices;
        var vm = this;
        vm.isTopoView = true;
        vm.isRemote = uiCtrl.isRemote();//(($rootScope.VERSION_NUMBER).toLowerCase().indexOf('x01') >= 0);
        vm.uiEnable = function (description, lv) {
            return uiCtrl.isShow(description, lv);
        };

        $rootScope.$on('addedToCurrentTopology', function () {
            $state.reload();
        });

        var uploader = $scope.uploader = new FileUploader({
            url: URI + '/files/topology/' + topologyId.id + '/fileupload',
            autoUpload: true,
            queueLimit: 1,
            removeAfterUpload: true
        });

        var deferred = $q.defer();

        uploader.onSuccessItem = function (item, response, status) {
            $rootScope.uploadTaskPromise = null;
            if (response.warningInfos.length) {
                $rootScope.addAlert({
                    type: 'warning',
                    content: '警告!\n- ' + response.warningInfos.join("\n- ")
                });
            } else if (status === 200) {
                $rootScope.addAlert({
                    type: 'success',
                    content: '拓扑文件上传成功'
                });
            }
            $scope.topologyHasNode = true;
            $scope.render();
        };

        uploader.onProgressAll = function () {
            $rootScope.uploadTaskPromise = deferred.promise;
        };

        uploader.onErrorItem = function (item, response) {
            $rootScope.uploadTaskPromise = null;
            $rootScope.addAlert({
                type: 'danger',
                content: response.error
            });
            console.log(uploader);
            if (uploader._directives.select.length && uploader._directives.select[0].element.length && uploader._directives.select[0].element[0].value) {
                uploader._directives.select[0].element[0].value = '';
            }
        };
    }

})();
