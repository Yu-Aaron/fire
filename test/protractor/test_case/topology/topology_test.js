'use strict';

var Login = require('../../common/login.js');
var Settings = require('../../common/settings.js');
var UploadTopology = require('../../common/uploadTopology.js');

var login = new Login();
var settings = new Settings();
var uploadTopology = new UploadTopology();

var delay = 1000;
var topo_path = "../files/ehan_jan13_2016.zip";
var confirm_edit_button = element(by.id('topology-singleTopo_button_saveEdit'));

describe('Topology Node Test: ', function() {

    beforeAll(function() {
		browser.get('http://127.0.0.1:3000');
        login.loginAsAdmin(); 
        settings.init();      
    });

	it('Delete node test', function() {
		var canvas = element(by.id('singleTopoIndexDiv'));
		var node_name = "HMI";
		var num_factory_devices = 2;
		var findDiagram = "var d = go.Diagram.fromDiv('topologySingle');";
		var findKey = "var node_to_be_deleted; for (var i = 0; i < d.allData.nodes.length; i++) { var node = d.findNodeForKey(-i); if (node) { if(node.rh.zoneName[0] == '" + node_name + "') {node_to_be_deleted = node;} }}"
		var selectNode = "d.select(node_to_be_deleted);"
		var delete_button = element(by.id('delete_a_node_from_topo'));

		uploadTopology.topoName(topo_path);
		element(by.id('header_li_topology')).click();		
		element(by.id('topology-singleTopo_button_enterEdit')).click();
		
		// click on the canvas, so subsequent keyboard keys can be sent to the browser
		browser.actions()
			.mouseMove(canvas, {x: 0, y: 0}) 
			.mouseMove({x: 600, y: 300}) 
			.click(protractor.Button.LEFT)
			.perform();

		// select HMI node and delete it	
		browser.executeScript(findDiagram + findKey + selectNode);
		browser.sleep(delay);
		browser.actions().sendKeys(protractor.Key.DELETE).perform();
		browser.sleep(delay);
				
		delete_button.click();
		browser.sleep(delay);
		confirm_edit_button.click();
		browser.sleep(delay);

		// check factory device row count should be 1 instead of 2
		element(by.id('header_li_asset')).click();		
		$('.left-navbar-item-factorydevice').click();
		expect($$('.factory-device-table > tbody > tr').count()).toBe(num_factory_devices - 1);
		browser.sleep(delay);
	}, 120000);

	it('Add node test', function() {
		var palette = element(by.id('topoPaletteDiv'));
		var canvas = element(by.id('topologySingle'));
		var num_network_devices = 0;

		uploadTopology.topoName(topo_path);
		element(by.id('header_li_topology')).click();		
		element(by.id('topology-singleTopo_button_enterEdit')).click();

		browser.actions()
			.mouseMove(palette, {x: 0, y: 0})
			.mouseMove({x: 100, y: 200})
			.click(protractor.Button.LEFT)
			.mouseDown()
			.mouseMove(palette, {x: 500, y: 300})
			.mouseMove(canvas, {x: 0, y: 0})
			.mouseMove(canvas, {x: 500, y: 300})
			.mouseUp()
			.perform();
		browser.sleep(delay);

		element(by.id('topology-device-model-list')).click();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		confirm_edit_button.click();
		browser.sleep(delay);

		element(by.id('header_li_asset')).click();		
		$('.left-navbar-item-networkdevice').click();
		expect($$('.table > tbody > tr').count()).toBe(num_network_devices + 1);
		browser.sleep(delay);
	}, 120000);



});