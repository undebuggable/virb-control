// import CONFIG from './virb-control-config.js'
import VirbControl from './virb-control.js'

(function init (_window) {
    var window = _window;
    function onWindowLoad () {
        var virbControl = new VirbControl(window);
    }
    (function init () {
        window.addEventListener(EVENT_LOAD, onWindowLoad);
    })();
})(window);