'use strict';

describe('common/service/snVal Test', function() {
    var forms;
    beforeEach(module('southWest.services'));
    beforeAll(function(done) {
        setTimeout(function() {
            var security_models = $.getJSON('base/assets/js/mock/models/device/getModels_securityDevice.json');
            security_models.done(function(data) {
                forms = data;
                done();
            });
        }, 200);
    });
    it('validSNFormat invalid', inject(function(snVal) {
        expect(snVal.validSNFormat('ZB0301BB0000001')).toBe(false);
        //  Too Long'
        expect(snVal.validSNFormat('ZB0301BB000000001')).toBe(false);
        //  Ports Not Number'
        expect(snVal.validSNFormat('ZBAA01BB00000001')).toBe(false);
        //  Version Not Number'
        expect(snVal.validSNFormat('ZB03AABB00000001')).toBe(false);
        //  Year Not Upper Case'
        expect(snVal.validSNFormat('ZB0301bB00000001')).toBe(false);
        //  Year Not Valid'
        expect(snVal.validSNFormat('ZB03011B00000001')).toBe(false);
        //  Month Not Upper Case'
        expect(snVal.validSNFormat('ZB0301Bb00000001')).toBe(false);
        //  Month Not Valid'
        expect(snVal.validSNFormat('ZB0301BD00000001')).toBe(false);
        //  SN Not Number'
        expect(snVal.validSNFormat('ZB0301BD0000000A')).toBe(false);
    }));
    it('validSNFormat valid', inject(function(snVal) {
        expect(snVal.validSNFormat('JC0101BB00000001')).toBe(true);
        expect(snVal.validSNFormat('JS0201BB00000001')).toBe(true);
        expect(snVal.validSNFormat('JA0301BB00000001')).toBe(true);
        expect(snVal.validSNFormat('JA0302BB00000001')).toBe(true);
        expect(snVal.validSNFormat('JA0401BB00000001')).toBe(true);
        expect(snVal.validSNFormat('ZB0101BB00000001')).toBe(true);
        expect(snVal.validSNFormat('ZB0201BB00000001')).toBe(true);
        expect(snVal.validSNFormat('ZB0301BB00000001')).toBe(true);
        expect(snVal.validSNFormat('ZB0401BB00000001')).toBe(true);
        expect(snVal.validSNFormat('SS0101BB00000001')).toBe(true);
        expect(snVal.validSNFormat('SC0101BB00000001')).toBe(true);
        expect(snVal.validSNFormat('SC0201BB00000001')).toBe(true);
        expect(snVal.validSNFormat('SC0301BB00000001')).toBe(true);
        expect(snVal.validSNFormat('SC0401BB00000001')).toBe(true);
    }));
    it('getModelBySN valid', inject(function(snVal) {
        // KEA-C200
        expect(snVal.getModelBySN('JC0101BB00000001', forms).id).toBe('Acorn001-63b9-408a-be6a-66cd9c592448');
        // KEA-C400
        expect(snVal.getModelBySN('JS0201BB00000001', forms).id).toBe('Acorn001-15f3-4f3e-b09a-271d02cf567b');
        // KEA-U1000
        expect(snVal.getModelBySN('JA0301BB00000001', forms).id).toBe('Acorn001-0900-48fb-8aba-5d438f1c3912');
        // KEA-U1000E
        expect(snVal.getModelBySN('JA0302BB00000001', forms).id).toBe('Acorn001-0900-48fb-8aba-5d438f1c3956');
        // KEA-U2000
        //expect(snVal.getModelBySN('JA0401BB00000001', forms).id).toBe('');
        // KEV-C200
        expect(snVal.getModelBySN('ZB0101BB00000001', forms).id).toBe('Acorn001-296d-47d3-8ec6-fe76fdea8d02');
        // KEV-C400
        expect(snVal.getModelBySN('ZB0201BB00000001', forms).id).toBe('Acorn001-81dd-4259-9ba0-7b00e467c4a0');
        // KEV-U800
        expect(snVal.getModelBySN('ZB0301BB00000001', forms).id).toBe('Acorn001-d2a4-4d64-818d-6bf8d719146e');
        // KEV-U1600
        expect(snVal.getModelBySN('ZB0401BB00000001', forms).id).toBe('Acorn001-eef7-458d-87a0-1fe3410d9268');
        // KEC-U1000
        expect(snVal.getModelBySN('SS0101BB00000001', forms).id).toBe('Acorn001-6a77-46eb-a5d1-98a7c12b3608');
        // KED-C200
        expect(snVal.getModelBySN('SC0101BB00000001', forms).id).toBe('Acorn001-18d4-49df-b0a0-bd2bc48af6e3');
        // KED-C400
        expect(snVal.getModelBySN('SC0201BB00000001', forms).id).toBe('Acorn001-52f5-4d51-9b38-6e1839e78d73');
        // KED-U800
        expect(snVal.getModelBySN('SC0301BB00000001', forms).id).toBe('Acorn001-a253-4d43-8e31-1e2370e0aca9');
        // KED-U1600
        expect(snVal.getModelBySN('SC0401BB00000001', forms).id).toBe('Acorn001-52cd-4d0e-b6b2-14eae1cedd6f');
    }));

});
