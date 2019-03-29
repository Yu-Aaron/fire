'use strict';

describe('common/service/formatVal Test', function(){
    describe('formatVal Test', function(){
        beforeEach(module('southWest.services'));
        it('Validate IP - 1.2.3.4', inject(function(formatVal){
            expect(formatVal.validateIp('1.2.3.4')).toBe(false);
        }));
        it('Validate MAC - aa:aa:aa:aa:aa:aa', inject(function(formatVal){
            expect(formatVal.validateMac('aa:aa:aa:aa:aa:aa')).toBe(false);
        }));
    });
});
