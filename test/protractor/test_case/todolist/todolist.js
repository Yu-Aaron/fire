'use strict';

var Login = require('../../common/login.js');
var Settings = require('../../common/settings.js');

describe('Todo List Test: ', function() {
  var settings = new Settings();
  var login = new Login();
  var host = settings.host;

  //============================= addMockModule to use mock up data ================================
  beforeAll(function() {
      browser.addMockModule('apiMockModule', function () {
          var serviceId = 'TopologyMock';
          angular.module('apiMockModule', [])
              .config(['$httpProvider', configApiMock])
              .factory(serviceId, [TopologyMock]);

          // Function that find topology id
          function TopologyMock() {
              return {
                  request: function (config) {
                      if(config && config.url && !window.topoId && (config.url.indexOf('api/v2.0/todolists/topology/')) > -1){
                          window.topoId = config.url.substr(config.url.indexOf('topology') + 9, 36);
                          console.log(window.topoId);
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
  it('open Todo List UI', function() {
    browser.get(host);
    settings.init();
    login.loginAsAdmin();
    var topoId;
    element(by.id('header_a_navUser')).click();
    element(by.id('header_li_todoList')).click();
    browser.executeScript('return window.topoId;').then(function(data){
      topoId = data;
      element(by.id('header_li_todoList')).isDisplayed().then(function () {
        var link = host + "/api/v2.0/todolists/topology/" + topoId + "/todolist/test";
        browser.executeScript('$.get("' + link + '")');
        browser.driver.sleep(4000);
        element(by.id('todolist_refresh_btn')).click().then(function(){
          expect(element.all(by.css('.new'))).toBeTruthy();
          var newNum;
          element.all(by.css('.new')).count().then(function(n){
            newNum = n;
            //var todoItem = element.all(by.css('.todolist-item')).get(0);
            expect(element(by.id('todoItem_btn_decline_0')).isPresent()).toBeTruthy();
            element(by.id('todoItem_btn_view_0')).click();
            element.all(by.css('.modal-close')).click();
            newNum--;
            expect(element.all(by.css('.new')).count()).toBe(newNum);
            element(by.id('todoItem_btn_decline_0')).click();
            expect(element(by.id('todoItem_btn_decline_0')).isPresent()).toBe(false);
          });
        });
      });
    });
  }, 120000);
  afterAll(function(){
    login.logout();
  });
});

