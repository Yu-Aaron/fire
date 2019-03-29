'use strict';

var Login = require('./login.js');
var Settings = require('./settings.js');
var path = require('path');

(function(){
	var PrivilegeTest = function(){
		var obj = this;
		obj.test = function(params) {
			describe(params.privilegeName + ' Privilege Test:', function() {
				var settings = new Settings();
				var login = new Login();
				var host = settings.host;
				var checkNextDelete = function (elements, index, length, compareTxt, target1css, target2id) {
					elements.get(index).getText().then(function (t) {
						if(t.indexOf(compareTxt)>-1){
							elements.get(index).element(by.css(target1css)).click();
							element(by.id(target2id)).click();
						}else{
							index++;
							index<length && checkNextDelete(elements, index, length, compareTxt, target1css, target2id);
						}
					})
				};
				it('1. Default admin should have privilege for ' + params.privilegeName + ': ', function() {
					browser.get(host);
					settings.init();
					login.loginAsAdmin();
					//TODO: upload new topology
					//====================Test for shown UI==============================
					params.testForAdmin();
				});

				it('2. Create ' + params.groupName + ' Group and User, user should not be able to view ' + params.privilegeName, function() {
					// Go to user group create page
					element(by.id('header_a_navUser')).click();
					element(by.id('header_li_userManagement')).click();

					// Delete old user if already exist.
					var users = element.all(by.css(".user_table_row_tr"));
					users.count().then(function(n){
						checkNextDelete(users, 0, n, params.userName, '.user_delete', 'user_group_delete_confirm');
					});
					browser.driver.sleep(4000);
					element(by.id('group_list_tab')).click();
					// Delete old group if already exist.
					var groups = element.all(by.css(".group_table_row_tr"));
					groups.count().then(function(n){
						checkNextDelete(groups, 0, n, params.groupName, '.user_group_delete', 'user_group_delete_confirm');
					});
					element(by.id('groups_create')).click();
					// Create group
					element.all(by.id('systemUserGroupEditInput')).first().sendKeys(params.groupName);
					element.all(by.id('input-stuffname')).first().sendKeys(params.groupName + " for unit test");
					element.all(by.id('userGroupPrivilege_' + params.privilegeName + '_none')).first().click();
					params.privilegeGroupName.map(function (n) {
						element.all(by.id('userGroupPrivilege_' + n + '_none')).first().click();
					});
					element.all(by.id('systemuser_group_edit_confirm')).first().click();

					// Create user and assign him to the new group
					element(by.id('user_list_tab')).click();
					element(by.id('user_list_create')).click();
					element.all(by.id('input-username')).first().sendKeys(params.userName);
					element.all(by.id('input-stuffname')).first().sendKeys(params.userName);
					element.all(by.id('input-password')).first().sendKeys("admin@123");
					element.all(by.id('input-confirm-password')).first().sendKeys("admin@123");
					element(by.id('group_select_radio_button_' + params.groupName)).click();
					element(by.id('systemuser_create_confirm')).click();

					// Login as new User and test
					login.logout();
					login.login(params.userName, "admin@123");

					//====================Test for hidden UI==============================
					params.testForNonePrivilege();

					login.logout();
				});
				
				if(params.hasView){
					it('3. Change ' + params.groupName + ' to have view right, user should not be able to view buttons: ', function() {
						login.loginAsAdmin();
						// Go to user group page
						element(by.id('header_a_navUser')).click();
						element(by.id('header_li_userManagement')).click();
						element(by.id('group_list_tab')).click();

						// edit group
						var groups = element.all(by.css(".group_table_row_tr"));
						groups.count().then(function(n){
							for(var i=0; i<n; i++){
								(function () {
									var index = i;
									groups.get(index).getText().then(function (t) {
										if(t.indexOf(params.groupName)>-1){
											groups.get(index).element(by.css('.user_group_edit')).click();
											element.all(by.id('userGroupPrivilege_' + params.privilegeName + '_view')).get(1).click();
											element.all(by.id('systemuser_group_edit_confirm')).get(1).click();
										}
									});
								})();
							}
						});
						// Login as new User and test
						login.logout();
						login.login(params.userName, "admin@123");

						//====================Test for shown UI==============================
						params.testForViewPrivilege();

						login.logout();
					});
				}

				it('4. delete ' + params.groupName + ' and its user: ', function() {
					login.loginAsAdmin();
					element(by.id('header_a_navUser')).click();
					element(by.id('header_li_userManagement')).click();
					// Delete user
					var users = element.all(by.css(".user_table_row_tr"));
					users.count().then(function(n){
						checkNextDelete(users, 0, n, params.userName, '.user_delete', 'user_group_delete_confirm');
					});
					browser.driver.sleep(2000);
					element(by.id('group_list_tab')).click();
					// Delete group
					var groups = element.all(by.css(".group_table_row_tr"));
					groups.count().then(function(n){
						checkNextDelete(groups, 0, n, params.groupName, '.user_group_delete', 'user_group_delete_confirm');
					});
					login.logout();
				});
			});

		};

	};
	module.exports = function() {
    	return new PrivilegeTest();
  	};
}());