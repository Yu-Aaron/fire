/**
 * Incident Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Incident', IncidentModel);

    function IncidentModel(_IncidentEventAPI) {
        return _IncidentEventAPI('incidents');
    }

})();
