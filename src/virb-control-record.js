function VirbControlRecord (_window) {
    var
        publicInterface,
        window = _window,
        document = window.document,
        elemForm = document.getElementById(ID.FORM),
        elemRecordStart = elemForm.querySelector('[name=' + COMMAND.RECORD_START.command + ']'),
        elemRecordStop = elemForm.querySelector('[name=' + COMMAND.RECORD_STOP.command + ']'),
        elemPicture = elemForm.querySelector('[name=' + COMMAND.PICTURE.command + ']'),
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
                    COMMAND.RECORD_START.command,
                    COMMAND.RECORD_STOP.command,
                    COMMAND.PICTURE.command
                ].indexOf(elemTargetName)
            ) {
                //debugger;
                controlCommand = {command: elemTargetName};
                elemTargetName == COMMAND.PICTURE.command && (
                    controlCommand[KEY.STATUS_TIMER] = Array.prototype.filter.call(
                        document.querySelectorAll('input[name=' + KEY.STATUS_TIMER + ']'),
                        function (radio) {
                            return radio.checked;
                        })[0].value
                );// jshint ignore:line
                console.log('Controlling the device\t' + JSON.stringify(controlCommand));
                virbControlDispatchEvent(EVENT_INPUT_CLICK, controlCommand);
                disableAllInputs(true);
            } else if (elemTargetName == 'export-status') {
                virbControlDispatchEvent(EVENT_EXPORT_HISTORY);
            }
        }
    }
    (function init () {
        if (!_window) {
            throw new Error(EXCEPTION.WINDOW_NOT_FOUND);
        }
        [elemRecordStart, elemRecordStop, elemPicture, elemExport].forEach(
            function (elem) {
                elem.addEventListener(EVENT_CLICK, onInputClick, false);
                elem.addEventListener(EVENT_TAP, onInputClick, false);
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