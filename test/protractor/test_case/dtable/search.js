'use strict';

var Login = require('../../common/login.js');
var Settings = require('../../common/settings.js');

//Protractor Test:
describe('dtable - searching Test with audit table: ', function() {
    //Functions need to be called before each 'it'
    var settings = new Settings();
    var login = new Login();
    //============================= addMockModule to use mock up data ================================
    beforeAll(function() {
        browser.addMockModule('apiMockModule', function () {
            var serviceId = 'SearchMock';
            angular.module('apiMockModule', [])
                .config(['$httpProvider', configApiMock])
                .factory(serviceId, [SearchMock]);

            // Function that find certain http request and replace the response with mockup data:
            function SearchMock() {
                return {
                    request: function (config) {
                        if(config && config.url && (config.url.indexOf('api/v2.0/auditlogs/topology/')) > -1){
                            window.searchCall_1 = false;
                            window.searchCall_2 = false;
                            if(config.params&&config.params.$filter.indexOf('AAAAA') > -1){
                                window.searchCall_1 = true;
                            }
                            if(config.params&&config.params.$filter.indexOf('BBBBB') > -1){
                                window.searchCall_2 = true;
                            }
                        }
                        if(config && config.url && (config.url.indexOf('TIMERANGETEST')) > -1){
                            window.searchCall_timeRange_start = false;
                            window.searchCall_timeRange_end = false;
                            if(config.url.indexOf('timestamp%2520ge%2520%') > -1 || config.url.indexOf('timestamp ge ') > -1 ){
                                window.searchCall_timeRange_start = true;
                            }
                            if(config.url.indexOf('timestamp%2520le%2520%') > -1 || config.url.indexOf('timestamp le ') > -1 ){
                                window.searchCall_timeRange_end = true;
                            }
                        }
                        return config;
                    },
                    response: function (response) {
                        return response;
                    }
                };
            }

            // Use the service as a interceptor for http request
            function configApiMock($httpProvider) {
                $httpProvider.interceptors.push(serviceId);
            }
        });
    });
    //============================= End of addMockModule ================================

    describe('dtable - searching filter fields Test: ', function() {
        it('Searching with normal search in audit table', function() {
            browser.get('http://127.0.0.1:3000');

            settings.init();
            login.loginAsAdmin();

            element(by.id('header_li_audit')).click();
            element(by.id('audit_sidenav_tab_3')).click();
            element(by.id('dtable-toolbar_button_search')).click();
            expect(browser.executeScript('return window.searchCall_1;')).toBeFalsy();
            element(by.id('dtable-toolbar_input_search')).sendKeys("AAAAA");
            // browser.executeScript('var searchCall_1 = false');
            element(by.id('dtable-toolbar_button_search')).click();
            expect(browser.executeScript('return window.searchCall_1;')).toBeTruthy();
        });

        it('Refresh should use previous search query', function() {
            // browser.executeScript('var searchCall_1 = false');
            element(by.id('audit_audittab_refresh_button')).click();
            expect(browser.executeScript('return window.searchCall_1;')).toBeTruthy();
        });

        it('Switch to Advance Search should remove previous search query', function() {
            element(by.id('dtable-toolbar_button_highAdvancedSearch')).click();
            // browser.executeScript('var searchCall_1 = false');
            element(by.id('audit_audittab_refresh_button')).click();
            expect(browser.executeScript('return window.searchCall_1;')).toBeFalsy();
        });

        it('Searching with advance search in audit table', function() {
            element(by.id('dtable-dtableAdvancedSearch_input_sourceIp')).sendKeys("BBBBB");
            // browser.executeScript('var searchCall_2 = false');
            element(by.id('dtable_advanceSearch_apply')).click();
            expect(browser.executeScript('return window.searchCall_2;')).toBeTruthy();
        });

        it('Refresh should use previous search query', function() {
            // browser.executeScript('var searchCall_2 = false');
            element(by.id('audit_audittab_refresh_button')).click();
            expect(browser.executeScript('return window.searchCall_2;')).toBeTruthy();
        });

        it('Switch to Normal Search should remove previous search query', function() {
            element(by.id('dtable-toolbar_button_highAdvancedSearch')).click();
            // browser.executeScript('var searchCall_2 = false');
            element(by.id('audit_audittab_refresh_button')).click();
            expect(browser.executeScript('return window.searchCall_2;')).toBeFalsy();
        });

        it('Switch Protocol should remove previous normal search query', function() {
            element(by.id('dtable-toolbar_input_search')).sendKeys("AAAAA");
            // browser.executeScript('var searchCall_1 = false');
            element(by.id('dtable-toolbar_button_search')).click();
            expect(browser.executeScript('return window.searchCall_1;')).toBeTruthy();
            element(by.id('audit_audittab_protocol_select')).click();
            element(by.id('audit_audittab_protocoloption_1')).click();
            expect(element(by.id('dtable-toolbar_input_search')).getAttribute('value')).toBe("");
            // browser.executeScript('var searchCall_1 = false');
            element(by.id('audit_audittab_refresh_button')).click();
            expect(browser.executeScript('return window.searchCall_1;')).toBeFalsy();
        });

        it('Switch Protocol should remove previous advance search query', function() {
            element(by.id('dtable-toolbar_button_highAdvancedSearch')).click();
            element(by.id('dtable-dtableAdvancedSearch_input_sourceIp')).sendKeys("BBBBB");
            element(by.id('dtable_advanceSearch_apply')).click();
            expect(browser.executeScript('return window.searchCall_2;')).toBeTruthy();
            element(by.id('audit_audittab_protocol_select')).click();
            element(by.id('audit_audittab_protocoloption_2')).click();
            expect(element(by.id('dtable-dtableAdvancedSearch_input_sourceIp')).getAttribute('value')).toBe("");
            // browser.executeScript('var searchCall_1 = false');
            element(by.id('audit_audittab_refresh_button')).click();
            expect(browser.executeScript('return window.searchCall_2;')).toBeFalsy();
        });
    });

    describe('dtable - searching time range Test: ', function() {
        it('Test for default time range selection: should not have start limit and end limit', function() {
            element(by.id('header_li_monitor')).click();
            element(by.id('monitor_a_event')).click();
            element(by.id('dtable-toolbar_input_search')).sendKeys("TIMERANGETEST");
            element(by.id('dtable-toolbar_button_search')).click();
            expect(browser.executeScript('return window.searchCall_timeRange_start;')).toBe(false);
            expect(browser.executeScript('return window.searchCall_timeRange_end;')).toBe(false);
            element(by.id('monitor-event-incident_button_refresh')).click();
            expect(browser.executeScript('return window.searchCall_timeRange_start;')).toBe(false);
            expect(browser.executeScript('return window.searchCall_timeRange_end;')).toBe(false);
            element(by.id('dtable-toolbar_button_highAdvancedSearch')).click();
            element(by.id('dtable-dtableAdvancedSearch_input_sourceName')).sendKeys("TIMERANGETEST");
            element(by.id('dtable_advanceSearch_apply')).click();
            expect(browser.executeScript('return window.searchCall_timeRange_start;')).toBe(false);
            expect(browser.executeScript('return window.searchCall_timeRange_end;')).toBe(false);
        });

        it('Test for time range within 1 hour: should have start limit, but not end limit', function() {
            element(by.id('dtable-dtableAdvancedSearch_select_timerange')).click();
            element(by.id('dtable_timeRange_h')).click();
            element(by.id('dtable_advanceSearch_apply')).click();
            expect(browser.executeScript('return window.searchCall_timeRange_start;')).toBe(true);
            expect(browser.executeScript('return window.searchCall_timeRange_end;')).toBe(false);
            element(by.id('monitor-event-incident_button_refresh')).click();
            expect(browser.executeScript('return window.searchCall_timeRange_start;')).toBe(true);
            expect(browser.executeScript('return window.searchCall_timeRange_end;')).toBe(false);
        });

        it('Test for time range customized selection: should have start limit, and end limit', function() {
            element(by.id('dtable-dtableAdvancedSearch_select_timerange')).click();
            element(by.id('dtable_timeRange_r')).click();
            element(by.id('dtable_advanceSearch_apply')).click();
            expect(browser.executeScript('return window.searchCall_timeRange_start;')).toBe(true);
            expect(browser.executeScript('return window.searchCall_timeRange_end;')).toBe(true);
            element(by.id('monitor-event-incident_button_refresh')).click();
            expect(browser.executeScript('return window.searchCall_timeRange_start;')).toBe(true);
            expect(browser.executeScript('return window.searchCall_timeRange_end;')).toBe(true);
        });
    });

    afterAll(function() {
        browser.removeMockModule('apiMockModule');
        login.logout();
    });
});

