/**
 * Deduction Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.reduction')
        .directive('reductionFtpTable', reductionFtpTable);

    function reductionFtpTable($q, Audit, $modal) {
        var auditTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/reduction/reductionFtpTab.html',
            link: link
        };

        return auditTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort'];
            ctrl.setConfig({
                name: 'audit',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                dateTimeRange: 'flowTimestamp'
            });
            ctrl.protocolSourceName = {
                'protocolSourceName': ''
            };

            ctrl.showDetailWindow = function (id) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/reduction/detail-ftp-panel.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl,
                    resolve: {
                        auditData: function () {
                            return Audit.getFtpControlFlowData(id).then(function (data) {
                                data.unitSize = "B";
                                if (data.packetLenth > 1024) {
                                    data.packetLenth /= 1024;
                                    data.unitSize = "KB";
                                }
                                if (data.packetLenth > 1024) {
                                    data.packetLenth /= 1024;
                                    data.unitSize = "MB";
                                }
                                return data;
                            });
                        }
                    }
                });

                modalInstance.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, auditData) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    //console.log(auditData);
                    $scope.auditData = auditData;
                    //console.log($scope.auditData);

                    $scope.done = function () {
                        $modalInstance.close('done');
                    };
                    $scope.download = function () {
                        Audit.getDownloadZipPath($scope.auditData).then(function (data) {
                            window.open('./' + data.data, '_self');
                        });
                        $modalInstance.close('done');
                    };
                }
            };
            ctrl.refresh = function () {
                getAll({});
            };

            function getCount(params) {
                return Audit.getCount(params);
            }

            function search(params) {
                return getAll(params);
            }

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'flowTimestamp desc';
                }
                var payload = params || {};
                return Audit.getSep('ftpcontrol', payload).then(function (listData) {
                    for (var i = 0; i < listData.length; i++) {
                        listData[i].flowTimestampLocal = new Date(listData[i].flowTimestamp);
                    }
                    return listData;
                });
            }
        }
    }
})();
