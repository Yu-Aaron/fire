'use strict';

var PrivilegeTest = require('../../../common/privilegeTest.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var host = settings.host;
	var pTest = new PrivilegeTest();
	var curPrivilege = "LOG_MANAGEMENT";
	var params = {
		privilegeName: curPrivilege,
		userName: curPrivilege + "_User",
		groupName: curPrivilege + "_GROUP",
		privilegeGroupName: [],
		privilegeUrl: "/monitor/logger",
		hasView: false,
		testForAdmin: testForAdmin,
		testForNonePrivilege: testForNonePrivilege,
		testForViewPrivilege: testForViewPrivilege
	}
	pTest.test(params);
	return;

	function testForAdmin () {
		element(by.id('header_li_monitor')).click();
		expect(element(by.id('LOG_MANAGEMENT')).isDisplayed()).toBeTruthy();
		element(by.id('LOG_MANAGEMENT')).click();
	}

	function testForNonePrivilege () {
		element(by.id('header_li_monitor')).click().then(function () {
			expect(element(by.id('LOG_MANAGEMENT')).isPresent()).toBe(false);
		});

		element(by.id('header_li_monitor')).click();
		browser.get(host + params.privilegeUrl).then(function () {
			browser.getCurrentUrl().then(function(actualUrl) {
				//("User will be redirected to monitor-overview by entering url");
				expect(actualUrl).toBe(host + '/monitor/overview');
			});
		});
		element(by.id('header_li_report')).click().then(function(){
			expect(element(by.id('report_a_logger')).isPresent()).toBe(false);
		})
		browser.get(host + '/report/logger').then(function () {
			browser.getCurrentUrl().then(function(actualUrl) {
				expect(actualUrl).toBe(host + '/monitor/overview');
			});
		});
	}

	function testForViewPrivilege () {
		//====================Test for shown UI==============================
		element(by.id('header_li_report')).click().then(function () {
			expect(element(by.id('report_a_logger')).isDisplayed()).toBe(true);
		});
		element(by.id('header_li_monitor')).click().then(function () {
			expect(element(by.id('LOG_MANAGEMENT')).isPresent()).toBe(true);
		});

		//====================Test for hidden UI==============================
		element(by.id('LOG_MANAGEMENT')).click().then(function(){
			expect(element(by.id('monitor-logger-logTab_button_openExportPanelFalse')).isPresent()).toBe(false);
		});
	};
});