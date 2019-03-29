/**
 * Created by Morgan on 14-11-07.
 */
/**
 * System Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('SystemUser', SystemUserModel);

    function SystemUserModel($http, URI, topologyId) {
        var url = URI + '/users';
        var service = {
            getUsers: getUsers,
            getRoles: getRoles,
            deleteUser: deleteUser,
            changeStatus: changeStatus,
            createUser: createUser,
            editUserPassword: editUserPassword,
            editUser: editUser,
            lockUser: lockUser,
            getUsersCount: getUsersCount,
            updateMyPassword: updateMyPassword,
            userToken: userToken,
            keepAlive: keepAlive,
            getUserGroup: getUserGroup,
            updateUserGroup: updateUserGroup,
            getCurrentUser: getCurrentUser,
            createGroup: createGroup,
            deleteGroup: deleteGroup,
            assignDevice: assignDevice
        };
        return service;

        //////////
        function getUsers() {
            topologyId.id = topologyId.id ? topologyId.id : localStorage.getItem('topologyId');
            return $http.get(url + '/' + topologyId.id).then(function (data) {
                return data.data;
            });
        }

        function getRoles() {
            return $http.get(URI + '/roles/' + topologyId.id).then(function (data) {
                return data.data;
            });
        }

        function deleteUser(userId) {
            return $http.put('/api/v2.0/users/user/' + userId + '/markasdeleted');
        }

        function changeStatus(index, status) {
            return $http.post('/api/v2.0/systemusers/changeStatus', {
                data: {
                    'index': index,
                    'status': status
                }
            });
        }

        function createUser(user) {
            console.log(user);
            return $http.post(url, user).then(function (data) {
                return data.data;
            });
        }

        function editUserPassword(user) {
            return $http.put('/api/v2.0/user/info', {
                'userId': user.userId,
                'name': user.name,
                'passwordHash': user.password
            });
        }

        function editUser(user) {
            return $http.put('/api/v2.0/users/user/info', user);
        }

        function userToken() {
            return true;
        }

        function keepAlive() {
            return true;
        }

        function lockUser(lock, userId) {
            return $http.put(url + '/user/' + lock + '/' + userId);
        }

        function updateMyPassword(password) {
            return $http.put(url + '/password', {
                'passwordHash': password
            });
        }

        function getUsersCount() {
            return $http.get(url).then(function (data) {
                return data.data.length;
            });
        }

        function getUserGroup(roleId) {
            return $http.get('/api/v2.0/roles/role/' + roleId).then(function (data) {
                return data.data;
            });
        }

        function updateUserGroup(userGroup) {
            return $http.put('/api/v2.0/roles', {
                role: {
                    "name": userGroup.role.name,
                    "comment": userGroup.role.comment,
                    "roleId": userGroup.role.roleId
                },
                targetAndActionValueForms: userGroup.targetAndActionValueForms,
                deviceIds: userGroup.deviceIds
            });
        }

        function getCurrentUser() {
            return $http.get('/api/v2.0/users/whoami').then(function (data) {
                return data.data;
            });
        }

        function createGroup(userGroup) {
            return $http.post('/api/v2.0/roles', {
                role: {
                    "name": userGroup.role.name,
                    "comment": userGroup.role.comment,
                },
                targetAndActionValueForms: userGroup.targetAndActionValueForms,
                deviceIds: userGroup.deviceIds
            });
        }

        function deleteGroup(roleId) {
            return $http.delete(URI + '/roles/role/' + roleId);
        }

        function assignDevice(roleId, devices) {
            return $http.put(URI + '/roles/topology/' + topologyId.id + '/role/' + roleId + '/devices', devices).then(function (data) {
                return data;
            });
        }
    }

})();
