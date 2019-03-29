/**
 * Created by Charlie
 */
(function () {
    'use strict';

    angular
        .module('southWest.attack')
        .directive('attackNewDiagram', attackNewDiagram);

    function attackNewDiagram() {
        var diagramObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            require: '^cdiagram',
            templateUrl: '/templates/attack/optimize-diagram.html',
            link: link
        };

        return diagramObj;

        function link(scope, el, attr, ctrl) {

            ctrl.setConfig({
                'setPosition': false,
                'isEdited': false,
                'isInfsafety': false,
                'isAttackPath': true,
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
