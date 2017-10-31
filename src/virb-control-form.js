function VirbControlForm (_window) {
    var
        publicInterface,
        window = _window,
        document = window.document,
        elemForm = document.getElementById(ID.FORM),
        elemOnoff = elemForm.querySelector('#'+ID.DEVICE_ONOFF),
        elemFeatures = elemForm.querySelector('#'+ID.ELEM_DEVICE_MULTIOPTION)
    ;
    function disableAllInputs (isDisabled) {
        var inputs = document.getElementsByTagName('input');
        Array.prototype.forEach.call(
            inputs,
            function (input) {
                if (!!isDisabled) input.setAttribute('disabled', 'true');
                if (!isDisabled) input.removeAttribute('disabled');
            });
    }
    function showAllFieldsets (isVisible) {
        var fieldsets = document.getElementsByTagName('fieldset');
        Array.prototype.forEach.call(
            fieldsets,
            function (fieldset) {
                fieldset.style.display = !!isVisible ? 'block' : 'none';
            }
        );
    }
    function clear () {
        [elemOnoff, elemFeatures].forEach(function (elem) {
            while (elem.childNodes.length) elem.removeChild(elem.firstChild);
        });
    }
    function renderConfigurationFeatureUI (feature) {
        var elemParent = (
            +feature.type == 1 ?
                elemFeatures : (
                +feature.type == 2 ?
                    elemOnoff : null
            )
        );
        if (elemParent) elemParent.appendChild(parseResponse(feature));
    }
    function virbControlDispatchEvent (eventName, eventObject) {
        var eventCustom = new CustomEvent(eventName, {detail: eventObject});
        document.dispatchEvent(eventCustom);
    }
    function onInputClick (e) {
        // debugger;
        var
            value, controlCommand,
            elemTarget = e.target,
            elemTargetType = elemTarget.type,
            elemTargetChecked = elemTarget.checked,
            elemTargetValue = elemTarget.value,
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
        } else {
            if (elemTargetType == 'checkbox') {
                value = +elemTargetChecked + '';
            }
            if (elemTargetType == 'radio') {
                value = elemTargetValue;
            }
            COMMAND.UPDATE.feature = elemTargetName;
            COMMAND.UPDATE.value = value;
            console.log('Updating the feature\t' + JSON.stringify(COMMAND.UPDATE));
            virbControlDispatchEvent(EVENT_INPUT_CLICK, COMMAND.UPDATE);
            disableAllInputs(true);
        }
    }
    function parseResponse (response) {
        var
            that = this,
            fragment = document.createDocumentFragment()
        ;
        // debugger;
        switch (+response.type) {
            case 1:
                var
                    fieldset = document.createElement('fieldset'),
                    legend = document.createElement('legend')
                ;
                legend.textContent = response.feature;
                fieldset.appendChild(legend);
                response.options.forEach(function (optionName, index) {
                    var
                        label, paragraph, radio
                    ;
                    paragraph = document.createElement('p');
                    radio = document.createElement('input');
                    label = document.createElement('label');
                    radio.setAttribute('type', 'radio');
                    radio.setAttribute('id', response.feature + '-' + optionName);
                    radio.setAttribute('value', optionName);
                    radio.setAttribute('name', response.feature);
                    radio.addEventListener(EVENT_CLICK, onInputClick, false);
                    radio.addEventListener(EVENT_TAP, onInputClick, false);
                    if (optionName == response.value) radio.setAttribute('checked', 'true');
                    label.textContent = optionName.concat(
                        KEY.FEATURE_SUMMARIES in response ?
                        ' (' + response[KEY.FEATURE_SUMMARIES][index] + ')'
                            : ''
                    );
                    label.setAttribute('for', response.feature + '-' + optionName);
                    paragraph.appendChild(radio);
                    paragraph.appendChild(label);
                    //fieldset.style.display('block');
                    fieldset.appendChild(paragraph);
                });
                fragment.appendChild(fieldset);
                break;
            case 2:
                var
                    checkbox = document.createElement('input'),
                    label = document.createElement('label'),
                    paragraph = document.createElement('p')
                ;
                checkbox.setAttribute('type', 'checkbox');
                checkbox.setAttribute('id', response.feature);
                checkbox.setAttribute('name', response.feature);
                if (response.value == response.enabled) checkbox.setAttribute('checked', 'true');
                checkbox.setAttribute('value', response.feature);
                checkbox.addEventListener(EVENT_CLICK, onInputClick, false);
                checkbox.addEventListener(EVENT_TAP, onInputClick, false);
                label.textContent = response.feature;
                label.setAttribute('for', response.feature);
                paragraph.appendChild(checkbox);
                paragraph.appendChild(label);
                fragment.appendChild(paragraph);
                break;
        }
        return fragment;
    }
    (function init () {
        if (!_window) {
            throw new Error(EXCEPTION.WINDOW_NOT_FOUND);
        }
        publicInterface = {
            // _bindOnInputClick: _bindOnInputClick,
            clear: clear,
            showAllFieldsets: showAllFieldsets,
            disableAllInputs: disableAllInputs,
            renderConfigurationFeatureUI: renderConfigurationFeatureUI,
            onInputClick: onInputClick
        };
    })();
    return publicInterface;
}