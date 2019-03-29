/**
 * Monitor Audit Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.forumpostdata')
        .directive('forumPostTable', ForumPostTable);

    function ForumPostTable($q, Audit, $modal, $log) {
        var auditTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/audit/forumpostdata/forumpost.html',
            link: link
        };

        return auditTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var fields = ['usrIp', 'usrMac', 'forumName', 'postTimestamp'];

            setConfig();

            function setConfig() {
                var advancedSearchOptions = [
                    {
                        'name': 'postTimestamp',
                        'display': '日期',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'usrIp', 'display': 'IP地址', 'input': 'ipAdress', 'option': false, value: ""},
                    {'name': 'usrMac', 'display': 'MAC地址', 'input': 'macAdress', 'option': false, value: ""},
                    {'name': 'forumName', 'display': '论坛名称', 'input': 'string', 'option': false, value: ""}
                ];

                var config = {
                    name: 'audit',
                    pagination: true,
                    scrollable: false,
                    totalCount: true,
                    getAll: getAll,
                    getCount: getCount,
                    search: search,
                    fields: fields,
//                    dateTimeRange: 'timestamp',
                    advancedSearch: 'forumpost'
                };
                ctrl.query = ctrl.isSearching = ctrl.advancedSearchQuery = "";
                angular.extend(config, {
                    advancedSearchOptions: advancedSearchOptions,
                    disabledTimeOptions: true
                });
                ctrl.setConfig(config);
            }

            function getCount(params) {
                //var hasAdvanceSearch = ctrl.advancedSearchQuery !== '' || ctrl.query !== '';

                return Audit.getForumpostCount(params);
            }

            function search(params) {
                scope.params = params;
                return getAll(params);
            }

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'postTimestamp desc';
                }
                //var hasAdvanceSearch = ctrl.advancedSearchQuery !== '' || ctrl.query !== '';

                scope.params = params;
                //console.log(params);

                return Audit.getForumpostAll(params).then(function (forumata) {
                    return forumata;
                });
            }

            scope.openExportPanel = function (flag) {
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        var regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*(_|[^\w])).+$/g;
                        return psw && psw.match(regex) && psw.length >= 8;
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        p['$orderby'] = "postTimestamp desc";
                        Audit.getForumpostExport(p, psw).then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.showDetailWindow = function (forumpost) {
                $q.all([]).then(function () {
                    var modalInstance = $modal.open({
                        templateUrl: 'templates/audit/forumpostdata/detailforumpost.html',
                        size: 'lg',
                        controller: ModalInstanceCtrl
                    });
                    modalInstance.result.then(function (msg) {
                        console.log(msg);
                    }, function () {
                        console.log('Modal dismissed at: ' + new Date());
                    });

                    function ModalInstanceCtrl($scope, $modalInstance) {
                        $scope.getData = function () {
                            var detailData = forumpost;
                            detailData.forumName = forumpost.forumName;
                            detailData.postTimestamp = forumpost.postTimestamp;
                            detailData.usrIp = forumpost.usrIp;
                            detailData.usrMac = forumpost.usrMac;
                            detailData.title = forumpost.title;
                            detailData.postContent = forumpost.postContent;
                            $scope.forumpostDataDetail = detailData;
                        };
                        $scope.getData();

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.done = function () {
                            $modalInstance.close('done');
                        };

                        $scope.trim = function (input) {
                            input = (input === null || input === undefined) ? '' : String(input);
                            return input.replace(/(^\s*)|(\s*$)/g, '');
                        };
                    }
                });
            };
        }
    }
})();
