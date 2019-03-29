/**
 * Event Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Event', IncidentModel);

    function IncidentModel(_IncidentEventAPI) {
        return _IncidentEventAPI('events');
    }

})();
