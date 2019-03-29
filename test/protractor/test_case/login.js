'use strict';

var Login = require('../common/login.js');
var Settings = require('../common/settings.js');
describe('Login Test: ', function() {
	var login = new Login();
  it('root successful login', function() {
  	browser.get('http://localhost:3000');
    var settings = new Settings();
    settings.init();

  	login.loginAsRoot();
    expect(element(by.id('header_a_navUser')).isPresent()).toBe(true);
  });

  it('root successful logout', function(){
  	login.logout();
  	expect(element(by.id('login_text_username')).isPresent()).toBe(true);
  });
});

