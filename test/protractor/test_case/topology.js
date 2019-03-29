'use strict';

var Login = require('../common/login.js');
var Settings = require('../common/settings.js');
var path = require('path');
describe('Topology Uploading Test: ', function() {

  function topoExist(){
    return element(by.id('sidePanelButton')).isDisplayed();
  }

  var settings = new Settings();
	var login = new Login();
  it('Topology uploading successful', function() {
  	browser.get('http://127.0.0.1:3000');
    settings.init();
  	login.loginAsAdmin();
    element(by.css('.notification_stay_alert')).isPresent().then(function () {
      element(by.id('header_li_topology')).click();
      var fileToUpload = '../files/simulator_topo.zip';
      var absolutePath = path.resolve(__dirname, fileToUpload);
      topoExist().then(function(exist){
        if(exist){
          element(by.id('topology-singleTopo_button_uploadTopologyModal')).click();
          element(by.id('topology-singleTopo_file_topologySelector')).sendKeys(absolutePath);
          element(by.css('.modal-dialog .modal-content .modal-footer .btn:nth-child(1)')).click();
          browser.wait(protractor.until.elementIsVisible(element(by.id('sidePanelButton'))), 5000);
          expect(topoExist()).toBe(true);
        }else{
          element(by.id('topology-singleTopo_file_topologySelector')).sendKeys(absolutePath);
          browser.wait(protractor.until.elementIsVisible(element(by.id('sidePanelButton'))), 5000);
          expect(topoExist()).toBe(true);
        }
      });
    });
  });

	it('Topology remove successful', function(){
     topoExist().then(function(exist){
      if(exist){
        $('.topo-header .text-right > .btn-group:nth-child(2) > button:nth-child(2)').click();
        $('#topology-singleTopo_button_clearTopo').click();
        expect($('.modal-dialog').isDisplayed()).toBe(true);
        $('.modal-dialog .modal-footer .btn:nth-child(2)').click();
        expect(topoExist()).toBe(false);
      }
     })
	});

  it('Topology uploading fail', function(){
  	var fileToUpload = '../files/avatar.png';
  	var absolutePath = path.resolve(__dirname, fileToUpload);
    element(by.id('topology-singleTopo_file_topologySelector')).sendKeys(absolutePath);
    browser.wait(protractor.until.elementIsVisible($('#request-result-popup')), 1000);
    expect(topoExist()).toBe(false);
  })

  it('successful logout', function(){
    login.logout();
    expect(element(by.id('login_text_username')).isPresent()).toBe(true);
  });
});

