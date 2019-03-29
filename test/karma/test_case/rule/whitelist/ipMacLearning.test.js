
describe('CS-6665: MAC 地址学习', function() {
    // Include all necessary module before each 'it';
    beforeEach(module('ui.router'));
    beforeEach(module('ui.bootstrap'));
    beforeEach(module('ngResource'));

    // Set constant value for injection
    beforeEach(function() {
        module('southWest.models', function($provide) {
            $provide.constant('URI', '/api/v2.0');
        });
    });

    beforeEach(module('southWest.services'));
    beforeEach(module('southWest.models'));
    beforeEach(module('southWest.rule.whitelist'));

    // Get models and change the return value for certain functions:
    beforeEach(inject(function($injector) {
        // Get models
        Learning = $injector.get('Learning');

        // Mockup data
        var getTask_Data = {
            data: {"learningResult":{"validFlowdataCount":620,"invalidFlowdataCount":0,"unknownNodeIpAddresses":[],"activeNodeIpAddresses":["192.168.3.101","192.168.3.201"],"allUnknownNodeIpAddresses":[],"allActiveNodeIpAddresses":["192.168.3.101","192.168.3.201"],"knownDevices":[{"deviceName":"Server VW(Windows)","ip":"192.168.3.201","timestamp":"2015-12-04T23:55Z"},{"deviceName":"Client VM(Linux)","ip":"192.168.3.101","timestamp":"2015-12-04T23:55Z"}],"unknownDevices":[],"dpiIPFlow":{},"dpiMACFlow":{},"ipMacError":{}},"taskId":"e152057b-ebf7-441f-9199-2878be0a0e8b","type":"ONCE","state":"SUCCESS","createdAt":"2015-12-04T23:55:03Z","updatedAt":"2015-12-05T00:15:02Z","startDatetime":"2015-12-04T23:55:02Z","endDatetime":"2015-12-05T00:15:02Z","category":"LEARNING","retryEnabled":false,"maximumNumberOfRetries":3,"prototypeId":0,"concurrencyScope":"GLOBAL","concurrentNum":1,"taskName":"04/12/2015, 15:55:02至04/12/2015, 16:15:02规则学习","_resultRef":{"baseUrl":"/policies/topology/0eae81e8-c288-478b-b7ad-7c6e81bc25eb/policy/dbb16fa6-e7ee-4839-81bb-2bffb0b9b4f1/blocks?type\u003dLEARN\u0026lockstatus\u003dNODEPLOY\u0026taskid\u003de152057b-ebf7-441f-9199-2878be0a0e8b\u0026$orderby\u003dpriority","type":"PolicyBlocks"},"timeoutInSeconds":0,"topologyId":"0eae81e8-c288-478b-b7ad-7c6e81bc25eb"}
        };
        var getTaskMac_Data = {
            data: [{"learnedIpMacId":"8d3fc036-a294-4aae-86e2-edf2de5739b3","deviceId":"bf081a30-d28e-4484-81a6-4d5142e91130","deviceIp":"192.168.3.101","realMac":"08:00:27:6f:50:98","createdAt":"2015-12-04 23:55:33.0","updatedAt":"2015-12-04 23:55:33.0","taskId":"e152057b-ebf7-441f-9199-2878be0a0e8b","deviceName":"Client VM(Linux)","topoMac":"08:00:27:6f:50:98","status":0},{"learnedIpMacId":"fdd2f698-12b8-4c55-ac6e-11b2b134da04","deviceId":"9962ce7a-f8c8-45fa-be2e-253405615b72","deviceIp":"192.168.3.201","realMac":"08:00:27:76:c7:b3","createdAt":"2015-12-04 23:55:34.0","updatedAt":"2015-12-04 23:55:34.0","taskId":"e152057b-ebf7-441f-9199-2878be0a0e8b","deviceName":"Server VW(Windows)","topoMac":"08:00:27:76:c7:b3","status":0}]
        }

        // Monitor on certain functions, once they get called, return designed value;
        spyOn(Learning, "getTask").and.returnValue({
            then: function(callback) {return callback(getTask_Data);}
        });
        spyOn(Learning, "getTaskMac").and.returnValue({
            then: function(callback) {return callback(getTaskMac_Data);}
        });
    }));

    // Pass angular object to local
    var $controller, $rootScope, $compile, Learning, scope;
    var state = { "previous": {} };
    var policiesArr = [1,2,3];
    beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_, _$compile_){
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      scope = $rootScope.$new();
    }));

    describe('editorCtrl - function: vm.learningDetail', function(){
        it('get correct learning result', function(){
            var ctrl = $controller('editorCtrl', {$scope: scope, $state: state, policiesArr: policiesArr});
            ctrl.learningDetail("123");
            expect(ctrl.taskId).toBe("123");
            expect(ctrl.detailPanelItem.learningResult.knownDevices.length).toBe(2);
            expect(ctrl.detailPanelItem.learningResult.knownDevices[0].deviceName).toBe("Server VW(Windows)");
            expect(ctrl.detailPanelItem.learningResult.knownDevices[1].deviceName).toBe("Client VM(Linux)");
            expect(ctrl.detailPanelItem.startDatetimeLocal).toBe('04/12/2015, 15:55:02');
            expect(ctrl.detailPanelItem.endDatetimeLocal).toBe('04/12/2015, 16:15:02');
            expect(ctrl.detailPanelItem.difference.days).toBe(0);
            expect(ctrl.detailPanelItem.difference.hours).toBe(0);
            expect(ctrl.detailPanelItem.difference.mins).toBe(20);
            expect(ctrl.detailPanelItem.macData.length).toBe(2);
            expect(ctrl.detailPanelItem.macData[0].topoMac).toBe("08:00:27:6f:50:98");
            expect(ctrl.detailPanelItem.macData[1].topoMac).toBe("08:00:27:76:c7:b3");
        });
    });

});
