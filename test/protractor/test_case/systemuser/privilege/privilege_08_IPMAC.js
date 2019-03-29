'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var login = new Login();
	var host = settings.host;

	var privilegeName = "WHITELIST";
	var userName = "WHITELIST_User";
	var groupName = "WHITELIST_GROUP";

	it('1. Default admin should have privilege for ' + privilegeName + ': ', function() {
	    browser.get(host);
	    settings.init();
	    login.loginAsAdmin();
	    expect(element(by.id('header_li_rule')).isDisplayed()).toBeTruthy();
	    element(by.id('header_li_rule')).click();
	    expect(element(by.id('rule_a_ipmac')).isDisplayed()).toBeTruthy();
	    element(by.id('rule_a_ipmac')).click();
	    expect(element(by.id('rule-ipmac_button_enterEdit')).isDisplayed()).toBeTruthy();
	});

	it('2. Create ' + groupName + ' Group and User, user should not be able to view ASSET tab, and MONITOR-DEVICE tab', function() {
		// Go to user group create page
		element(by.id('header_a_navUser')).click();
		element(by.id('header_li_userManagement')).click();

		// Delete old user if already exist.
		var users = element.all(by.css(".user_table_row_tr"));
		users.count().then(function(n){
			for(var i=0; i<n; i++){
				var index = i;
				users.get(index).getText().then(function (t) {
					if(t.indexOf(userName)>-1){
						users.get(index).element(by.css('.user_delete')).click();
						element(by.id('user_group_delete_confirm')).click();
						console.log("Old user deleted");
					}
				});
			}
		});
		browser.driver.sleep(4000);
		element(by.id('group_list_tab')).click();
		// Delete old group if already exist.
		var groups = element.all(by.css(".group_table_row_tr"));
		groups.count().then(function(n){
			for(var i=0; i<n; i++){
				var index = i;
				groups.get(index).getText().then(function (t) {
					if(t.indexOf(groupName)>-1){
						groups.get(index).element(by.css('.user_group_delete')).click();
						element(by.id('user_group_delete_confirm')).click();
						console.log("Old group deleted");
					}
				});
			}
		});

		element(by.id('groups_create')).click();
		// Create group
		element.all(by.id('systemUserGroupEditInput')).first().sendKeys(groupName);
		element.all(by.id('input-stuffname')).first().sendKeys(groupName + " for unit test");
		element.all(by.id('userGroupPrivilege_POLICY_none')).first().click();
		element.all(by.id('systemuser_group_edit_confirm')).first().click();

		// Create user and assign him to the new group
		element(by.id('user_list_tab')).click();
		element(by.id('user_list_create')).click();
		element.all(by.id('input-username')).first().sendKeys(userName);
		element.all(by.id('input-stuffname')).first().sendKeys(userName);
		element.all(by.id('input-password')).first().sendKeys("admin@123");
		element.all(by.id('input-confirm-password')).first().sendKeys("admin@123");
		element(by.id('group_select_radio_button_' + groupName)).click();
		element(by.id('systemuser_create_confirm')).click();

		// Login as new User and test
		login.logout();
		login.login(userName, "admin@123");
		expect(element(by.id('header_li_rule')).isPresent()).toBe(false);

	    browser.get(host + "/rule/ipmac").then(function () {
	    	browser.getCurrentUrl().then(function(actualUrl) {
	    		console.log("User will be redirected to monitor-overview when try to access to ipmac page by entering url");
	    		expect(actualUrl).toBe(host + '/monitor/overview');
	    	});
	    });
		login.logout();
	});

	it('3. Change ' + groupName + ' to have view right, user should not be able to view buttons: ', function() {
		browser.driver.sleep(2000);
		login.loginAsAdmin();
		// Go to user group page
		element(by.id('header_a_navUser')).click();
		element(by.id('header_li_userManagement')).click();
		element(by.id('group_list_tab')).click();

		// edit group
		var groups = element.all(by.css(".group_table_row_tr"));
		groups.count().then(function(n){
			for(var i=0; i<n; i++){
				var index = i;
				groups.get(index).getText().then(function (t) {
					if(t.indexOf(groupName)>-1){
						groups.get(index).element(by.css('.user_group_edit')).click();
						element.all(by.id('userGroupPrivilege_POLICY_view')).get(1).click();
						element.all(by.id('systemuser_group_edit_confirm')).get(1).click();
					}
				});
			}
		});
		// Login as new User and test
		login.logout();
		login.login(userName, "admin@123");
		expect(element(by.id('header_li_rule')).isDisplayed()).toBe(true);
		element(by.id('header_li_rule')).click();
		expect(element(by.id('rule_a_ipmac')).isDisplayed()).toBe(true);
	    element(by.id('rule_a_ipmac')).click().then(function () {
			expect(element(by.id('rule-ipmac_button_enterEdit')).isPresent()).toBe(false);
		});
		login.logout();

		login.loginAsAdmin();
		element(by.id('header_a_navUser')).click();
		element(by.id('header_li_userManagement')).click();
		// Delete user
		var users = element.all(by.css(".user_table_row_tr"));
		users.count().then(function(n){
			for(var i=0; i<n; i++){
				var index = i;
				users.get(index).getText().then(function (t) {
					if(t.indexOf(userName)>-1){
						users.get(index).element(by.css('.user_delete')).click();
						element(by.id('user_group_delete_confirm')).click();
						console.log("New user deleted");
					}
				});
			}
		});
		browser.driver.sleep(4000);
		element(by.id('group_list_tab')).click();
		// Delete group
		var groups = element.all(by.css(".group_table_row_tr"));
		groups.count().then(function(n){
			for(var i=0; i<n; i++){
				var index = i;
				groups.get(index).getText().then(function (t) {
					if(t.indexOf(groupName)>-1){
						groups.get(index).element(by.css('.user_group_delete')).click();
						element(by.id('user_group_delete_confirm')).click();
						console.log("New group deleted");
					}
				});
			}
		});
		login.logout();
	});
});