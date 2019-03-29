'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var UploadTopology = require('../../../common/uploadTopology.js');
var path = require('path');

describe('Rule - Whitelist - Learning - Time Pick Test:', function () {
	var settings = new Settings();
	var login = new Login();
	var uploadTopology = new UploadTopology();
	var host = settings.host;

	it('Time Length more than 60000 days should fail - by days:', function () {
		browser.get(host);
		settings.init();
		login.loginAsAdmin();
		uploadTopology.simpleTopo();
		element(by.id('header_li_rule')).click();
		element(by.id('rule_a_whitelist')).click();
		element(by.id('rule_a_sub_learning')).click();
		element(by.id('learningInterval_text_days')).click();
		element(by.id('learningInterval_text_days')).click();

		element(by.id('learningInterval_text_days')).clear().then(function () {
	    	element(by.id('learningInterval_text_days')).sendKeys(60001);
	    	expect(element(by.id('learningInterval_error_container')).isDisplayed()).toBeTruthy();
		});
	});
	it('Time Length more than 60000 days should fail - by hours:', function () {
		element(by.id('learningInterval_text_days')).clear().then(function () {
			element(by.id('learningInterval_text_hours')).clear().then(function () {
		    	element(by.id('learningInterval_text_days')).sendKeys(59999);
		    	element(by.id('learningInterval_text_hours')).sendKeys(25);
		    	expect(element(by.id('learningInterval_error_container')).isDisplayed()).toBeTruthy();
		    });
		});
	});
	it('Time Length more than 60000 days should fail - by minutes:', function () {
		element(by.id('learningInterval_text_days')).clear().then(function () {
			element(by.id('learningInterval_text_hours')).clear().then(function () {
				element(by.id('learningInterval_text_minutes')).clear().then(function () {
			    	element(by.id('learningInterval_text_days')).sendKeys(59999);
			    	element(by.id('learningInterval_text_hours')).sendKeys(23);
			    	element(by.id('learningInterval_text_minutes')).sendKeys(61);
			    	expect(element(by.id('learningInterval_error_container')).isDisplayed()).toBeTruthy();
			    });
		    });
		});
	});
	it('Time Length less than 60000 days should success', function() {
		element(by.id('learningInterval_text_days')).clear().then(function () {
			element(by.id('learningInterval_text_hours')).clear().then(function () {
				element(by.id('learningInterval_text_minutes')).clear().then(function () {
			    	element(by.id('learningInterval_text_days')).sendKeys(59999);
			    	element(by.id('learningInterval_text_hours')).sendKeys(23);
		    		element(by.id('learningInterval_text_minutes')).sendKeys(59);
		    		expect(element(by.id('learningInterval_error_container')).isDisplayed()).toBeFalsy();
		    	});
		    });
		});
	});

	it('Start Time before Current Time should fail - by date:', function () {
		element.all(by.id('learningTimePicker_date_start')).get(1).click();
		element.all(by.id('learningTimePicker_date_start')).get(1).clear().then(function () {
			element.all(by.id('learningTimePicker_date_start')).get(1).sendKeys('2014-12-01');
			element.all(by.id('learningTimePicker_time_start')).get(1).click();
			expect(element(by.id('learningTimePicker_start_error_time_min')).isDisplayed()).toBeTruthy();
		});
	});
	it('Start Time before Current Time should fail - by time:', function () {
		element(by.id('rule_a_sub_whitelist')).click();
		element(by.id('rule_a_sub_learning')).click();
		element.all(by.id('learningTimePicker_time_start')).get(1).click();
		element.all(by.id('learningTimePicker_time_start')).get(1).clear().then(function () {
			element.all(by.id('learningTimePicker_time_start')).get(1).sendKeys('00:00:01');
			element.all(by.id('learningTimePicker_date_start')).get(1).click();
			expect(element(by.id('learningTimePicker_start_error_time_min')).isDisplayed()).toBeTruthy();
		});
	});
	it('Start Time before End Time should fail - by date:', function () {
		element(by.id('rule_a_sub_whitelist')).click();
		element(by.id('rule_a_sub_learning')).click();
		element.all(by.id('learningTimePicker_date_start')).get(1).click();
		element.all(by.id('learningTimePicker_date_start')).get(1).clear().then(function () {
			element.all(by.id('learningTimePicker_date_start')).get(1).sendKeys('2199-12-30');
			element.all(by.id('learningTimePicker_time_start')).get(1).click();
			expect(element(by.id('learningTimePicker_end_error_time_min')).isDisplayed()).toBeTruthy();
		});
	});
	it('Start Time before End Time should fail - by time:', function () {
		element(by.id('rule_a_sub_whitelist')).click();
		element(by.id('rule_a_sub_learning')).click();
		element.all(by.id('learningTimePicker_time_start')).get(1).click();
		element.all(by.id('learningTimePicker_time_start')).get(1).clear().then(function () {
			element.all(by.id('learningTimePicker_time_start')).get(1).sendKeys('23:59:59');
			element.all(by.id('learningTimePicker_date_start')).get(1).click();
			expect(element(by.id('learningTimePicker_end_error_time_min')).isDisplayed()).toBeTruthy();
		});
	});
	it('End Time after 2200/1/1 should fail:', function () {
		element(by.id('rule_a_sub_whitelist')).click();
		element(by.id('rule_a_sub_learning')).click();
		element.all(by.id('learningTimePicker_date_end')).get(1).click();
		element.all(by.id('learningTimePicker_date_end')).get(1).clear().then(function () {
			element.all(by.id('learningTimePicker_time_end')).get(1).clear().then(function () {
				element.all(by.id('learningTimePicker_date_end')).get(1).sendKeys('2200-1-1');
				element.all(by.id('learningTimePicker_time_end')).get(1).sendKeys('00:00:01');
				element.all(by.id('learningTimePicker_date_start')).get(1).click();
				expect(element(by.id('learningTimePicker_end_error_time_max')).isDisplayed()).toBeTruthy();
			});
		});
	});
	it('End Time before 2200/1/1 should success:', function () {
		element(by.id('rule_a_sub_whitelist')).click();
		element(by.id('rule_a_sub_learning')).click();
		element.all(by.id('learningTimePicker_date_end')).get(1).click();
		element.all(by.id('learningTimePicker_date_end')).get(1).clear().then(function () {
			element.all(by.id('learningTimePicker_time_end')).get(1).clear().then(function () {
				element.all(by.id('learningTimePicker_date_end')).get(1).sendKeys('2199-12-31');
				element.all(by.id('learningTimePicker_time_end')).get(1).sendKeys('23:59:59');
				element.all(by.id('learningTimePicker_date_start')).get(1).click();
				expect(element(by.id('learningTimePicker_end_error_time_max')).isDisplayed()).toBeFalsy();
				login.logout();
			});
		});
	});
});
