/**
 * Created by Charlie
 */
(function () {
    'use strict';

    angular
        .module('southWest.infsafety')
        .directive('infsafetyNewDiagram', infsafetyNewDiagram);

    function infsafetyNewDiagram() {
        var diagramObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            require: '^cdiagram',
            templateUrl: '/templates/infsafety/optimize-diagram.html',
            link: link
        };

        return diagramObj;

        function link(scope, el, attr, ctrl) {

            ctrl.setConfig({
                'setPosition': false,
                'isEdited': false,
                'isInfsafety': true,
                'isAttackPath': false,
                'EditTopo': EditTopo,
                'drawInfsafety': drawInfsafety,
                'drawAttackPath': drawAttackPath
            });

            function EditTopo() {
            }

            function drawInfsafety() {
            }

            function drawAttackPath() {
            }

        }
    }
})();
