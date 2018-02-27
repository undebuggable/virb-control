import CONFIG from './virb-control-config.js'

export default function VirbControlRecord (_window) {
    var
        publicInterface,
        window = _window,
        document = window.document,
        elemForm = document.getElementById(CONFIG.ID.FORM),
        elemRecordStart = elemForm.querySelector('[name=' + CONFIG.COMMAND.RECORD_START.command + ']'),
        elemRecordStop = elemForm.querySelector('[name=' + CONFIG.COMMAND.RECORD_STOP.command + ']'),
        elemPicture = elemForm.querySelector('[name=' + CONFIG.COMMAND.PICTURE.command + ']'),
        elemExport = elemForm.querySelector('[name='+ 'export-status' + ']')
    ;
    function disableAllInputs (isDisabled) {
        [elemRecordStart, elemRecordStop, elemPicture, elemExport].forEach(
            function (elem) {
                if (!!isDisabled) elem.setAttribute('disabled', 'true');
                if (!isDisabled) elem.removeAttribute('disabled');
            }
        );
    }
    function virbControlDispatchEvent (eventName, eventObject) {
        var eventCustom = new CustomEvent(eventName, {detail: eventObject});
        document.dispatchEvent(eventCustom);
    }
    function onInputClick (e) {
        // debugger;
        var
            controlCommand,
            elemTarget = e.target,
            elemTargetType = elemTarget.type,
            //Name of the feature
            elemTargetName = elemTarget.name
        ;
        //debugger;
        if (elemTargetType == 'button') {
            if (
                ~[
                    CONFIG.COMMAND.RECORD_START.command,
                    CONFIG.COMMAND.RECORD_STOP.command,
                    CONFIG.COMMAND.PICTURE.command
                ].indexOf(elemTargetName)
            ) {
                //debugger;
                controlCommand = {command: elemTargetName};
                elemTargetName == CONFIG.COMMAND.PICTURE.command && (
                    controlCommand[CONFIG.KEY.STATUS_TIMER] = Array.prototype.filter.call(
                        document.querySelectorAll('input[name=' + CONFIG.KEY.STATUS_TIMER + ']'),
                        function (radio) {
                            return radio.checked;
                        })[0].value
                );// jshint ignore:line
                console.log('Controlling the device\t' + JSON.stringify(controlCommand));
                virbControlDispatchEvent(CONFIG.EVENT_INPUT_CLICK, controlCommand);
                disableAllInputs(true);
            } else if (elemTargetName == 'export-status') {
                virbControlDispatchEvent(CONFIG.EVENT_EXPORT_HISTORY);
            }
        }
    }
    (function init () {
        if (!_window) {
            throw new Error(CONFIG.EXCEPTION.WINDOW_NOT_FOUND);
        }
        [elemRecordStart, elemRecordStop, elemPicture, elemExport].forEach(
            function (elem) {
                elem.addEventListener(CONFIG.EVENT_CLICK, onInputClick, false);
                elem.addEventListener(CONFIG.EVENT_TAP, onInputClick, false);
            }
        );
        publicInterface = {
            // _bindOnInputClick: _bindOnInputClick,
            //showAllFieldsets: showAllFieldsets,
            disableAllInputs: disableAllInputs
            //renderConfigurationFeatureUI: renderConfigurationFeatureUI,
            //onInputClick: onInputClick
        };
    })();
    return publicInterface;
}