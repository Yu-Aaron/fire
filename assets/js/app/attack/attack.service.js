(function () {
    'use strict';

    angular
        .module('southWest.attack')
        .service('AttackedPath', AttackedPath)
        .service('AttackedDevice', AttackedDevice);

    function AttackedDevice() {
        return function AttackedDevice(data) {
            if (data) {
                this.selectedId = data.selectedId;
                this.attackMethod = data.attackMethod;
                this.attackResult = data.attackResult;
                this.queryArray = data.queryArray;
            }

            this.setQuery = function (queryArray) {
                this.queryArray = queryArray;
                // send to mw
                // return devices list => array
                // [
                //	{id: ...}, {id: ....}
                //]
                this.table = [];
            };


            this.getQuery = function () {
                return this.queryArray;
            };

            this.getTable = function () {
                return this.table;
            };

            this.setSelectedDevice = function (id) {
                this.selectedId = id;
            };

            this.getSelectedDevice = function () {
                return this.selectedId;
            };

            this.setMethod = function (attackMethod) {
                // attackMethod: Object
                // attackMethod: {
                // 	method: Number - attackId,
                // 	description: String
                // }
                this.attackMethod = attackMethod;
            };
            this.getMethod = function () {
                return this.attackMethod;
            };

            this.setResult = function (attackResult) {
                // result: Object
                // result: {
                // 	description: String
                // }
                this.attackResult = attackResult;
            };

            this.getResult = function () {
                return this.attackResult;
            };

            this.updateAttackedDevice = function () {
                // send -> {
                // 	deviceId: this.selectedId,
                // 	attackMethod: this.attackMethod,
                // 	result: this.result,
                //  timestamp: new Date()
                // }
                // REST API -> mw
                // return SUCCESS | FAILED
            };
        };
    }

    function AttackedPath() {
        return function AttackedPath(data) {
            if (data) {
                this.pathName = data.pathName;
                this.attackedTargetArray = data.attackedTargetArray;
                this.topologyId = data.topologyId;
                this.pathId = data.pathId;
                this.createTime = data.createTime;
                this.lastModifiedTime = data.lastModifiedTime;
            }

            this.setName = function (pathName) {
                this.pathName = pathName;
            };

            this.getName = function () {
                return this.pathName;
            };

            this.setAttackedTargetArray = function (array) {
                this.attackedTargetArray = array;
            };

            this.getAttackedTargetArray = function () {
                return this.attackedTargetArray;
            };

            this.setTopologyId = function (id) {
                this.topologyId = id;
            };

            this.getTopologyId = function () {
                return this.topologyId;
            };

            this.setPathId = function (id) {
                this.pathId = id;
            };

            this.getPathId = function () {
                return this.pathId;
            };

            this.setCreateTime = function (time) {
                this.createTime = time;
            };

            this.getCreateTime = function () {
                return this.createTime;
            };

            this.setLastModifiedTime = function (time) {
                this.lastModifiedTime = time;
            };

            this.getLastModifiedTime = function () {
                return this.lastModifiedTime;
            };
        };
    }

})();
