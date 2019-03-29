'use strict';

var PrivilegeTest = require('../../../common/privilegeTest.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var host = settings.host;
	var pTest = new PrivilegeTest();
	var curPrivilege = "POLICY";
	var params = {
		privilegeName: curPrivilege,
		userName: curPrivilege + "_User",
		groupName: curPrivilege + "_GROUP",
		privilegeGroupName: [],
		privilegeUrl: "/rule/blacklist",
		hasView: false,
		testForAdmin: testForAdmin,
		testForNonePrivilege: testForNonePrivilege,
		testForViewPrivilege: testForViewPrivilege
	}
	pTest.test(params);
	return;

	function testForAdmin () {
		expect(element(by.id('header_li_rule')).isDisplayed()).toBeTruthy();
		element(by.id('header_li_rule')).click();
		expect(element(by.id('rule_a_blacklist')).isDisplayed()).toBeTruthy();
		expect(element(by.id('rule_a_whitelist')).isDisplayed()).toBeTruthy();
		expect(element(by.id('rule_a_ipmac')).isDisplayed()).toBeTruthy();
		element(by.id('rule_a_ipmac')).click();
		expect(element(by.id('rule-ipmac_button_enterEdit')).isDisplayed()).toBeTruthy();
	}

	function testForNonePrivilege () {
		expect(element(by.id('header_li_rule')).isPresent()).toBe(false);
		browser.get(host + '/rule/blacklist').then(function () {
			browser.getCurrentUrl().then(function(actualUrl) {
				expect(actualUrl).toBe(host + '/monitor/overview');
			});
		});
	}

	function testForViewPrivilege () {
		//====================Test for shown UI==============================
		expect(element(by.id('header_li_rule')).isDisplayed()).toBeTruthy();
		element(by.id('header_li_rule')).click().then(function () {
			expect(element(by.id('rule_a_ipmac')).isDisplayed()).toBe(true);
		});

		//====================Test for hidden UI==============================
		element(by.id('rule_a_ipmac')).click().then(function () {
			expect(element(by.id('rule-ipmac_button_enterEdit')).isDisplayed()).toBe(false);
		});
	};
});