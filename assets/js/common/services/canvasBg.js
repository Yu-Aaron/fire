(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('canvasBg', canvasBg);

    function canvasBg () {
        return {
            generateAnimatedLogo: function () {
                var t, e, i;
                for (t = document.createElement("div"),
                         t.className = "animated-logo",
                         e = 1; 5 > e; e++){
                    i = document.createElement("div"),
                        i.className = "white-block block-" + e,
                        t.appendChild(i);
                }
                return t;
            },
            initializeEngine: function () {
                var e, n, o = document.getElementById("jumbotron"), s = document.getElementById("jumbotron-content"), r = document.getElementById("typewriter"), logo = document.getElementById('login-info');
                if(o) {
                    n = document.createElement("div"),
                        n.id = "galaxy-bg",
                        n.className = "galaxy-bg",
                        o.appendChild(n),
                        s.appendChild(this.generateAnimatedLogo()),
                        e = document.createElement("canvas"),
                        e.className = "terraform-canvas",
                        o.appendChild(e);
                    return (new window.Engine(e, n, r, logo));
                }
            },
        };
    }
})();
