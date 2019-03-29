'use strict';

var PrivilegeTest = require('../../../common/privilegeTest.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var host = settings.host;
	var pTest = new PrivilegeTest();
	var curPrivilege = "AUDIT_MANAGEMENT";
	var params = {
		privilegeName: curPrivilege,
		userName: curPrivilege + "_User",
		groupName: curPrivilege + "_GROUP",
		privilegeGroupName: [],
		privilegeUrl: "/audit/dpidata",
		hasView: false,
		testForAdmin: testForAdmin,
		testForNonePrivilege: testForNonePrivilege,
		testForViewPrivilege: testForViewPrivilege
	}
	pTest.test(params);
	return;

	function testForAdmin () {
		element(by.id('header_li_audit')).click();
		expect(element(by.id('audit_sidenav_tab_0')).isPresent()).toBeTruthy();
		element(by.id('header_li_report')).click();
		expect(element(by.id('report_a_protocol')).isDisplayed()).toBe(true);
	}

	function testForNonePrivilege () {
		expect(element(by.id('header_li_audit')).isPresent()).toBe(false);
		browser.get(host + params.privilegeUrl).then(function () {
			browser.getCurrentUrl().then(function(actualUrl) {
				expect(actualUrl).toBe(host + '/monitor/overview');
			});
		});
		element(by.id('header_li_report')).click().then(function(){
			expect(element(by.id('report_a_protocol')).isPresent()).toBe(false);
		})
		browser.get(host + '/report/protocol').then(function () {
			browser.getCurrentUrl().then(function(actualUrl) {
				expect(actualUrl).toBe(host + '/monitor/overview');
			});
		});
	}

	function testForViewPrivilege () {
		//EMPTY
	};
});