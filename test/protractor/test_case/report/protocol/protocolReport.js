'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var UploadTopology = require('../../../common/uploadTopology.js');
var Mocks = require('../../../common/mock.js');

//Protractor Test:
describe('Report - Protocol Test: ', function() {
    var settings = new Settings();
    var login = new Login();
    var uploadTopology = new UploadTopology();
    var host = settings.host;
    var mock = new Mocks();

    //Functions need to be called before each 'it'
    beforeAll(function() {
    //============================= addMockModule to use mock up data ================================
        browser.addMockModule('apiMockModule', function () {
            var serviceId = 'AuditMock';
            angular.module('apiMockModule', [])
                .config(['$httpProvider', configApiMock])
                .factory(serviceId, [AuditMock]);

            // Function that find certain http request and replace the response with mockup data:
            function AuditMock() {
                var getGrouphttpMac = false;
                var getGroupgooseMac = false;
                var getDataMac = false;
                var getFirstDataMac = false;
                return {
                    request: function (config) {
                        return config;
                    },
                    response: function (response) {
                        getGrouphttpMac = response.config.url.indexOf('/auditlogs/flowdata/type/') > -1 && response.config.url.indexOf('/frequency/') > -1;
                        getGroupgooseMac = response.config.url.indexOf('/auditlogs/flowdata/type/') > -1 && response.config.url.indexOf('/frequency/') > -1;
                        getDataMac = response.config.url.indexOf('/auditlogs/topology/') > -1 && response.config.url.indexOf('/heads') > -1 && response.config.url.indexOf('count') === -1 && response.config.params.$limit === 100;
                        getFirstDataMac = response.config.url.indexOf('/auditlogs/topology/') > -1 && response.config.url.indexOf('/heads') > -1 && response.config.params.$limit === 1;

                        if(getGrouphttpMac){
                            response.data = window.grouphttpMac;
                        }
                        if(getGroupgooseMac){
                            response.data = window.groupgooseMac;
                        }
                        if(getDataMac){
                            response.data = window.dataMac;
                        }
                        if(getFirstDataMac){
                            response.data = window.fisrtdataMac;
                        }
                        return response;
                    }
                };
            }

            // Use the service as a interceptor for http request
            function configApiMock($httpProvider) {
                $httpProvider.interceptors.push(serviceId);
            }
        });
    //============================= End of addMockModule ================================
    });

    it('Report - Protocol Test', function() {
        browser.get(host);
        settings.init();
        login.loginAsAdmin();
        //uploadTopology.simpleTopo();

        function rand () {
            return Math.floor((Math.random() * 100) + 1).toString();
        }
        browser.executeScript('window.grouphttpMac = [{"flowTimestamp":"2015-12-18T08:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T09:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T10:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T11:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T12:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T13:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T14:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T15:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T16:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T17:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T18:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T19:00Z","value":"0"},{"flowTimestamp":"2015-12-18T20:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T21:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T22:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T23:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T00:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T01:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T02:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T03:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T04:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T05:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T06:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T07:00Z","value":"' + rand() + '"}]');
        browser.executeScript('window.groupgooseMac = [{"flowTimestamp":"2015-12-18T08:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T09:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T10:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T11:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T12:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T13:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T14:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T15:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T16:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T17:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T18:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T19:00Z","value":"0"},{"flowTimestamp":"2015-12-18T20:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T21:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T22:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-18T23:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T00:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T01:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T02:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T03:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T04:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T05:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T06:00Z","value":"' + rand() + '"},{"flowTimestamp":"2015-12-19T07:00Z","value":"' + rand() + '"}]');
        browser.executeScript('window.dataMac = [{"dpiIp":"","flowTimestamp":"2014-12-25T04:34:57Z","packetTimestamp":"2014-12-25T04:34:57Z","sourceMac":"08:00:27:6f:50:98","destinationMac":"08:00:27:76:c7:b3","ipVersion":4,"sourceIp":"192.168.3.101","destinationIp":"192.168.3.201","sourcePort":50596,"destinationPort":502,"protocolType":6,"packetLenth":81,"deviceId":"1a1d9e4e-1a8c-4d0c-bf52-47e2a11e259e","flowdataHeadId":1978,"protocolSourceName":"modbus","protocolTypeName":"TCP","operationLogId":0,"createdAt":"2015-12-17T23:46:03Z","packetLenthSum":0}]');
        
        var now = new Date();
        browser.executeScript('window.fisrtdataMac = [{"dpiIp":"","flowTimestamp":"2015-12-18T04:34:57Z","packetTimestamp":"2015-12-18T04:34:57Z","sourceMac":"08:00:27:6f:50:98","destinationMac":"08:00:27:76:c7:b3","ipVersion":4,"sourceIp":"192.168.3.101","destinationIp":"192.168.3.201","sourcePort":50596,"destinationPort":502,"protocolType":6,"packetLenth":81,"deviceId":"1a1d9e4e-1a8c-4d0c-bf52-47e2a11e259e","flowdataHeadId":1978,"protocolSourceName":"http","protocolTypeName":"TCP","operationLogId":0,"createdAt":"2015-12-18T23:46:03Z","packetLenthSum":0}]');
        element(by.id('header_li_report')).click();
        element(by.id('report_a_protocol')).click();
        expect(element(by.id('report_protocol_table_row_detail_button_0')).isDisplayed()).toBeTruthy();
        element(by.id('report_protocol_table_row_detail_button_0')).click();
        expect(element(by.id('report_protocol_detail_table_row_0')).isDisplayed()).toBeTruthy();
        element(by.id('report_protocol_detail_return_button')).click();

        element(by.id('header_li_report')).click();
        browser.executeScript('window.fisrtdataMac = [{"dpiIp":"","packetTimestamp":"2015-12-18T04:34:57Z","sourceMac":"08:00:27:6f:50:98","destinationMac":"08:00:27:76:c7:b3","ipVersion":4,"sourceIp":"192.168.3.101","destinationIp":"192.168.3.201","sourcePort":50596,"destinationPort":502,"protocolType":6,"packetLenth":81,"deviceId":"1a1d9e4e-1a8c-4d0c-bf52-47e2a11e259e","flowdataHeadId":1978,"protocolSourceName":"goose","protocolTypeName":"TCP","operationLogId":0,"createdAt":"2015-12-18T23:46:03Z","packetLenthSum":0}]');
        element(by.id('report_a_protocol')).click();
        expect(element(by.id('report_protocol_table_row_detail_button_0')).isDisplayed()).toBeTruthy();
        element(by.id('report_protocol_table_row_detail_button_0')).click();
        expect(element(by.id('report_protocol_detail_table_row_0')).isDisplayed()).toBeTruthy();
        element(by.id('report_protocol_detail_return_button')).click();
    });

    afterAll(function() {
        browser.removeMockModule('apiMockModule');
        login.logout();
    });
});








