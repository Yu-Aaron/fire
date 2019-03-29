/**
 * SystemUser Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.record')
        .controller('RecordCtrl', RecordCtrl);

    function RecordCtrl(Record, $modal, $scope, $log) {
        var vm = this;
        $scope.deleteArray = [];

        vm.generateRecord = function () {

            Record.generateRecord().then(function (data) {
                console.log(data);
                $scope.$$childHead.refreshTable();
            });
        };

        vm.downloadRecord = function (path) {
            //console.log(path);
            window.open('./' + path, '_self');
        };

        vm.deleteRecord = function (id) {
            //console.log(id);
            $scope.deleteArray.push(id);
            var modalInstance = $modal.open({
                templateUrl: 'delete-record-confirmation.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    items: function () {
                        return $scope.deleteArray;
                    },
                    cb: function () {
                        return $scope.$$childHead.refreshTable;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, items, cb) {
                $scope.items = items;

                $scope.ok = function () {
                    Record.deleteRecord(items).then(cb);
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        };
    }

})();
