'use strict';

var PrivilegeTest = require('../../../common/privilegeTest.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var host = settings.host;
	var pTest = new PrivilegeTest();
	var curPrivilege = "ATTACKPATH";
	var params = {
		privilegeName: curPrivilege,
		userName: curPrivilege + "_User",
		groupName: curPrivilege + "_GROUP",
		privilegeGroupName: [],
		privilegeUrl: "/attack",
		hasView: false,
		testForAdmin: testForAdmin,
		testForNonePrivilege: testForNonePrivilege,
		testForViewPrivilege: testForViewPrivilege
	}
	pTest.test(params);
	return;

	function testForAdmin () {
		element(by.id('header_li_attack')).click();
		expect(element(by.css('.attack-new-target')).isPresent()).toBeTruthy();
	}

	function testForNonePrivilege () {
		expect(element(by.id('header_li_attack')).isPresent()).toBe(false);

		browser.get(host + params.privilegeUrl).then(function () {
			browser.getCurrentUrl().then(function(actualUrl) {
				expect(actualUrl).toBe(host + '/monitor/overview');
			});
		});
	}

	function testForViewPrivilege () {
		//EMPTY
	};
});