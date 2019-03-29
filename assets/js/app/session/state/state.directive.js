/**
 * Session Directive
 *
 */

(function () {
    'use strict';

    angular.module("southWest.session.state")
        .directive("sessionStateTable", sessionStateTable);

    function sessionStateTable(SessionStateModel) {
        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/session/state/sessionStateTable.html',
            link: link
        };
        return obj;

        function link(scope, element, attr, ctrl) {
            scope.strategyList = [{'value': '-1', 'text': ''}];
            scope.connStateList = [{'value': '-1', 'text': ''}];
            ctrl.setConfig({
                name: 'item',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: ['sourceIp', 'targetIp', 'serviceApp', 'connectionState', 'strategyRef'],
                advancedSearch: 'item',
                advancedSearchOptions: [
                    {'name': 'sourceIp', 'display': '源IP', 'input': 'ipAdress', 'option': false, value: ""},
                    {'name': 'targetIp', 'display': '目标IP', 'input': 'ipAdress', 'option': false, value: ""},
                    {'name': 'serviceApp', 'display': '应用名称', 'input': 'string', 'option': false, value: ""},
                    {'name': 'connectionState', 'display': '连接状态', 'input': 'checkbox', 'option': true, 'parser': 'string', 'options': scope.connStateList},
                    {'name': 'strategyRef', 'display': '策略引用', 'input': 'checkbox', 'option': true, 'parser':'string', 'options': scope.strategyList}
                ]
            });
            ctrl.highAdvancedSearch();

            function loadConnectionState(){
                var connStateListData = [{"value":"NEW",  "text":"NEW"},
                    {"value":"ESTABED", "text":"ESTABED"},
                    {"value":"CLOSED", "text":"CLOSED"},
                    {"value":"TCP_NONE", "text":"TCP_NONE"},
                    {"value":"TCP_LISTEN", "text":"TCP_LISTEN"},
                    {"value":"TCP_SYN_SENT", "text":"TCP_SYN_SENT"},
                    {"value":"TCP_SYN_RECV", "text":"TCP_SYN_RECV"},
                    {"value":"TCP_ESTABLISHED", "text":"TCP_ESTABLISHED"},
                    {"value":"TCP_FIN_WAIT1", "text":"TCP_FIN_WAIT1"},
                    {"value":"TCP_FIN_WAIT2", "text":"TCP_FIN_WAIT2"},
                    {"value":"TCP_TIME_WAIT", "text":"TCP_TIME_WAIT"},
                    {"value":"TCP_LAST_ACK", "text":"TCP_LAST_ACK"},
                    {"value":"TCP_CLOSE_WAIT", "text":"TCP_CLOSE_WAIT"},
                    {"value":"TCP_CLOSING", "text":"TCP_CLOSING"},
                    {"value":"TCP_CLOSED", "text":"TCP_CLOSED"}];
                angular.forEach(connStateListData, function(d){
                    scope.connStateList.push(d);
                });
            }
            loadConnectionState();

            function loadStrategyList(){
                SessionStateModel.getStrategyList().then(function(data){
                    if(data && angular.isArray(data)){
                        data.forEach(function(item){
                            scope.strategyList.push({
                                value: item.id,
                                text: item.name
                            });
                        });
                    }
                });
            }
            loadStrategyList();

            function getAll(params) {
                scope.params = params;
                return SessionStateModel.getAll(params, scope.dtable).then(function (data) {
                    scope.sessionStateLoaded(data);
                    return data;
                });
            }

            function getCount() {
                return SessionStateModel.getCount(scope.dtable);
            }

            function search(params) {
                return getAll(params);
            }
        }
    }
})();
