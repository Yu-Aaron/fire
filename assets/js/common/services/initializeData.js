/**
 * Created by Morgan on 15-01-07.
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('initializeData', initializeData);

    function initializeData(Signature) {
        //console.log(blocks);
        return function (vm, policyId, blockType, blocks, callback) {
            if (blockType === 'signature') {
                var policyBlockIdArray = [];
                blocks.forEach(function (item) {
                    policyBlockIdArray.push(item.policyBlockId);
                });
                Signature.availableBlocks(policyId, blockType, policyBlockIdArray).then(function (data) {
                    vm.blockCount = 0;
                    vm.selectedBlockCount = 0;
                    vm.selectedSignatureCount = 0;
                    vm.selectAll = vm.selectAllSigs || false;
                    for (var a = 0; a < blocks.length; a++) {
                        blocks[a].checked = vm.selectAllSigs || false;
                        vm.selectedBlockCount = vm.selectAllSigs ? vm.totalNum : 0;
                        vm.blockCount += blocks[a]['_signaturesCount'];
                        vm.blockCount += blocks[a]['_rulesCount'];
                        if (!_.contains(data.data, blocks[a].policyBlockId)) {
                            blocks[a].deployed = true;
                        }
                    }
                    if (callback) {
                        callback(blocks);
                    }
                });


            } else {
                Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy').then(function (data) {
                    //console.log(data.data);
                    vm.blockCount = 0;
                    vm.selectedBlockCount = 0;
                    vm.selectedSignatureCount = 0;
                    vm.selectAll = vm.selectAllSigs || false;
                    for (var a = 0; a < blocks.length; a++) {
                        blocks[a].checked = vm.selectAllSigs || false;
                        vm.blockCount += blocks[a]['_signaturesCount'];
                        vm.blockCount += blocks[a]['_rulesCount'];
                        for (var b = 0; b < data.data.length; b++) {
                            if (blocks[a].policyBlockId === data.data[b].sourceId) {
                                blocks[a].deployed = true;
                            }
                        }
                    }
                    if (callback) {
                        callback(blocks);
                    }
                });
            }
        };
    }
})();
