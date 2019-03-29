'use strict';

var PrivilegeTest = require('../../../common/privilegeTest.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	console.log(new Date());
	var settings = new Settings();
	var host = settings.host;
	var pTest = new PrivilegeTest();
	var curPrivilege = "REAL_TIME_PROTECTION";
	var params = {
		privilegeName: curPrivilege,
		userName: curPrivilege + "_User",
		groupName: curPrivilege + "_GROUP",
		privilegeGroupName: [],
		privilegeUrl: "/monitor/overview",
		hasView: false,
		testForAdmin: testForAdmin,
		testForNonePrivilege: testForNonePrivilege,
		testForViewPrivilege: testForViewPrivilege
	}
	pTest.test(params);
	return;

	function testForAdmin () {
		element(by.id('header_li_monitor')).click();
		expect(element(by.id('REAL_TIME_PROTECTION')).isDisplayed()).toBeTruthy();
		element(by.id('REAL_TIME_PROTECTION')).click();
		expect(element(by.id('edit_ovManagement_btn')).isDisplayed()).toBeTruthy();
	}

	function testForNonePrivilege () {
		element(by.id('header_li_monitor')).click().then(function () {
			expect(element(by.id('REAL_TIME_PROTECTION')).isPresent()).toBe(false);
		});

		element(by.id('header_li_monitor')).click();
		browser.get(host + params.privilegeUrl).then(function () {
			browser.getCurrentUrl().then(function(actualUrl) {
				//("User will be redirected to monitor-event by entering url");
				expect(actualUrl).toBe(host + '/monitor/event');
			});
		});
		browser.get(host + "/asdf").then(function () {
			browser.getCurrentUrl().then(function(actualUrl) {
				//("User will be redirected to monitor-event when try to access to invalid page by entering url");
				expect(actualUrl).toBe(host + '/monitor/event');
			});
		});
	}

	function testForViewPrivilege () {
		//EMPTY
	};
});