'use strict';
var path = require('path');
(function(){
	function topoExist(){
    return element(by.id('sidePanelButton')).isDisplayed();
  }
	var UploadTopology = function(){
		var obj = this;

		obj.simpleTopo = function(){
      element(by.css('.notification_stay_alert')).isPresent().then(function () {
        element(by.id('header_li_topology')).click();
        var fileToUpload = '../files/simulator_topo.zip';
        var absolutePath = path.resolve(__dirname, fileToUpload);
        topoExist().then(function(exist){
          if(exist){
            element(by.id('topology-singleTopo_button_uploadTopologyModal')).click();
            element(by.id('topology-singleTopo_file_topologySelector')).sendKeys(absolutePath);
            element(by.css('.modal-dialog .modal-content .modal-footer .btn:nth-child(1)')).click();
          }else{
            element(by.id('topology-singleTopo_file_topologySelector')).sendKeys(absolutePath);
          }
          browser.wait(function(){
            return $('#include_div_requestResult-0').isPresent().then(function(data){
              return data;
            })
          }, 15000);
        });
      });
		};

    obj.topoName = function(filepath){
      element(by.css('.notification_stay_alert')).isPresent().then(function () {
        element(by.id('header_li_topology')).click();
        var fileToUpload = filepath;
        var absolutePath = path.resolve(__dirname, fileToUpload);
        topoExist().then(function(exist){
          if(exist){
            element(by.id('topology-singleTopo_button_uploadTopologyModal')).click();
            element(by.id('topology-singleTopo_file_topologySelector')).sendKeys(absolutePath);
            element(by.css('.modal-dialog .modal-content .modal-footer .btn:nth-child(1)')).click();
          }else{
            element(by.id('topology-singleTopo_file_topologySelector')).sendKeys(absolutePath);
          }
          browser.wait(function(){
            return $('#include_div_requestResult-0').isPresent().then(function(data){
              return data;
            })
          }, 15000);
        });
      });
    };
	};
	module.exports = function() {
    return new UploadTopology();
  };
}());
