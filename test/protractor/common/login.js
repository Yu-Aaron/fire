'use strict';
(function(){
	var Login = function(){
		var obj = this;
		obj.loginAsRoot = function(){
			element(by.id('login_text_username')).sendKeys('root');
	    	element(by.id('login_text_password')).sendKeys('root12345');
	    	element(by.id('login_button_loginButton')).click();
		};
		obj.logout = function(){
			element(by.css('.notification_alert')).isPresent().then(function () {
				element(by.id('header_a_navUser')).click();
	  			element(by.id('header_li_logOut')).click();
			});
		};
		obj.loginAsAdmin = function(){
			element(by.id('login_text_username')).sendKeys('admin');
	    	element(by.id('login_text_password')).sendKeys('admin@123');
	    	element(by.id('login_button_loginButton')).click();
		}
		obj.login = function(username, psw){
			element(by.id('login_text_username')).sendKeys(username);
	    	element(by.id('login_text_password')).sendKeys(psw);
	    	element(by.id('login_button_loginButton')).click();
		}
	};
	module.exports = function() {
    return new Login();
  };
}());