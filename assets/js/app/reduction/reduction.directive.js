/**
 * Deduction Directive
 *
 * Description
 */

/* global saveAs */

(function () {
    'use strict';

    angular
        .module('southWest.reduction')
        .directive('reductionTable', reductionTable);

    function reductionTable($q, Audit, $modal, $rootScope) {
        var auditTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/reduction/reductionTab.html',
            link: link
        };

        return auditTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort'];
            ctrl.setConfig({
                name: 'reduction',
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

            ctrl.showDetailWindow = function (id, type) {
                if (type === 'telnet') {
                    type += 'stream';
                }
                var modalInstance = $modal.open({
                    templateUrl: 'templates/reduction/detail-panel.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });
                modalInstance.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.getData = function () {
                        // Memorize latest psw
                        var pswTemp;
                        if ($scope.auditDataDetail) {
                            pswTemp = {
                                cmdZipPsw: $scope.auditDataDetail.cmdZipPsw,
                                zipPsw: $scope.auditDataDetail.zipPsw,
                                fileZipPsw: $scope.auditDataDetail.fileZipPsw
                            };
                        }
                        return Audit.get(id, type).then(function (detailData) {
                            if (!detailData) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '无法打开详细信息'
                                });
                                return;
                            }
                            detailData.unitSize = "B";
                            detailData.flowTimestampLocal = detailData.flowTimestamp ? (new Date(detailData.flowTimestamp)) : null;
                            if (detailData.packetLenth && detailData.packetLenth > 1024) {
                                detailData.packetLenth /= 1024;
                                detailData.unitSize = "KB";
                            }
                            if (detailData.packetLenth && detailData.packetLenth > 1024) {
                                detailData.packetLenth /= 1024;
                                detailData.unitSize = "MB";
                            }
                            if (detailData.flowdataHead && detailData.flowdataHead.protocolSourceName && detailData.flowdataHead.protocolSourceName === "ftpcontrol") {
                                return Audit.getViewCommand(detailData).then(function (cmd) {
                                    //cmd = cmd.replace(/(?:\r\n|\r|\n)/g, '<br />');
                                    detailData._commands = cmd.toString();
                                    $scope.auditDataDetail = detailData;
                                    $scope.auditDataDetail.cmdZipPsw = pswTemp ? pswTemp.cmdZipPsw : '';
                                    $scope.auditDataDetail.zipPsw = pswTemp ? pswTemp.zipPsw : '';
                                    $scope.auditDataDetail.fileZipPsw = pswTemp ? pswTemp.fileZipPsw : '';
                                });
                            }
                            $scope.auditDataDetail = detailData;
                            $scope.auditDataDetail.cmdZipPsw = pswTemp ? pswTemp.cmdZipPsw : '';
                            $scope.auditDataDetail.zipPsw = pswTemp ? pswTemp.zipPsw : '';
                            $scope.auditDataDetail.fileZipPsw = pswTemp ? pswTemp.fileZipPsw : '';
                            return;
                        });
                    };
                    $scope.getData();

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.done = function () {
                        $modalInstance.close('done');
                    };
                    $scope.downloadCommand = function () {
                        $scope.getData().then(function () {
                            Audit.getDownloadCommand($scope.auditDataDetail).then(function (data) {
                                window.open('./' + data.data, '_self');
                            });
                            $modalInstance.close('done');
                        });
                    };
                    $scope.downloadFile = function (fileId, fileName, timeoutFlag) {
                        var downloadFile = function () {
                            Audit.getDownloadFileZipPath($scope.auditDataDetail, fileId).then(function (data) {
                                var file = new Blob([data.data], {type: 'application/zip'});
                                saveAs(file, fileName ? (fileName + ".zip") : "file.zip");
                            });
                        };
                        $scope.getData().then(function () {
                            function ModalInstanceCtrlConfirm($scope, $modalInstance) {
                                $scope.fileName = fileName;
                                $scope.cancel = function () {
                                    $modalInstance.dismiss('cancel');
                                };
                                $scope.confirm = function () {
                                    downloadFile();
                                    $modalInstance.close('done');
                                };
                            }

                            if (timeoutFlag) {
                                var modalInstanceConfirm = $modal.open({
                                    templateUrl: 'templates/reduction/confirmDownload.html',
                                    size: 'sm',
                                    controller: ModalInstanceCtrlConfirm
                                });
                                modalInstanceConfirm.result.then(function (msg) {
                                    console.log(msg);
                                }, function () {
                                    console.log('Modal dismissed at: ' + new Date());
                                });
                            } else {
                                downloadFile();
                            }
                        });
                    };
                    $scope.downloadZip = function () {
                        $scope.getData().then(function () {
                            Audit.getDownloadZipPath($scope.auditDataDetail).then(function (data) {
                                window.open('./' + data.data, '_self');
                            }, function () {
                                $modalInstance.close('done');
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '文件下载失败'
                                });
                            });
                            $modalInstance.close('done');
                        });
                    };
                }
            };
            ctrl.refresh = function () {
                getAll({});
            };

            function getCount(params) {
                var filter = "(protocolSourceName eq 'ftpcontrol' or protocolSourceName eq 'telnet' or protocolSourceName eq 'hexagon')";
                var payload = params || {};
                payload['$filter'] = payload['$filter'] ? payload['$filter'] + ' and ' + filter : filter;
                return Audit.getReductionCount(payload);
            }

            function search(params) {
                return getAll(params);
            }

            // function getAll(params) {
            //     if (!params['$orderby'] || params['$orderby'] === '') {
            //         params['$orderby'] = 'flowTimestamp desc';
            //     }
            //     var filter = '(protocolSourceName eq ftpcontrol) or (protocolSourceName eq telnet) or (protocolSourceName eq hexagon)';
            //     var payload = params || {};
            //     payload['$filter'] = filter;
            //     return Audit.getAll(payload).then(function (listData) {
            //         console.log(listData);
            //         return listData.length ? $q.all(listData).then(function (detail) {
            //             var set = listData.map(function (d, i) {
            //                 listData[i].flowTimestampLocal = new Date(listData[i].flowTimestamp);
            //                 listData[i].detail = detail;
            //                 return Audit.get(listData[i].flowdataHeadId, listData[i].protocolSourceName).then(function (detail) {
            //                     for (var index in detail) {
            //                         if (index) {
            //                             detail[index].packetTimestampLocal = new Date(detail[index].packetTimestamp);
            //                             if (detail[index].hexagon_payload) {
            //                                 var s = JSON.stringify(detail[index].hexagon_payload);
            //                                 detail[index].hexagon_payload = s.replace(/\\n/g, "\\n")
            //                                                                  .replace(/\\'/g, "\\'")
            //                                                                  .replace(/\\"/g, '\\"')
            //                                                                  .replace(/\\&/g, "\\&")
            //                                                                  .replace(/\\r/g, "\\r")
            //                                                                  .replace(/\\t/g, "\\t")
            //                                                                  .replace(/\\b/g, "\\b")
            //                                                                  .replace(/\\f/g, "\\f");
            //                             }
            //                         }
            //                     }
            //                     d.detail = detail;
            //                 });
            //             });
            //             return $q.all(set).then(function () {
            //                 return listData;
            //             });
            //         }) : [];
            //     });
            // }

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'flowTimestamp desc';
                }
                var filter = "(protocolSourceName eq 'ftpcontrol' or protocolSourceName eq 'telnet' or protocolSourceName eq 'hexagon')";
                var payload = params || {};
                payload['$filter'] = payload['$filter'] ? payload['$filter'] + ' and ' + filter : filter;
                return Audit.getAllReduction(payload).then(function (listData) {
                    listData.map(function (d) {
                        d.flowTimestampLocal = d.flowTimestamp ? (new Date(d.flowTimestamp)) : null;
                    });
                    //console.log(listData);
                    return listData;
                });
            }
        }
    }
})();
