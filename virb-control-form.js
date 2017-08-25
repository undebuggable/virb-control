function VirbControlForm (_elemForm) {
    if (!_elemForm) {
      throw new Error(EXCEPTION.FORM_NOT_FOUND);
    } else {
        var
            self = this,
            elemForm = _elemForm
        ;
        self.elemOnoff = elemForm.querySelector('#'+ID.DEVICE_ONOFF);
        self.elemFeatures = elemForm.querySelector('#'+ID.ELEM_DEVICE_MULTIOPTION);
        self._bindOnInputClick = self.onInputClick.bind(self);
    };
}
VirbControlForm.prototype.disableAllInputs = function (isDisabled) {
    var inputs = document.getElementsByTagName('input');
    Array.prototype.forEach.call(
        inputs,
        function (input) {
            !!isDisabled && input.setAttribute('disabled', 'true');
            !isDisabled && input.removeAttribute('disabled');
        });
};
VirbControlForm.prototype.showAllFieldsets = function (isVisible) {
    var fieldsets = document.getElementsByTagName('fieldset');
    Array.prototype.forEach.call(
        fieldsets,
        function (fieldset) {
            fieldset.style.display = !!isVisible ? 'block' : 'none';
        }
    )
};
VirbControlForm.prototype.clear = function () {
    this.elemOnoff.innerHTML = '';
    this.elemFeatures.innerHTML = '';
};
VirbControlForm.prototype.renderConfigurationFeatureUI = function (feature) {
    var elemParent = (
        +feature.type == 1 ?
            this.elemFeatures : (
            +feature.type == 2 ?
                this.elemOnoff : null
        )
    );
    elemParent && elemParent.appendChild(this.parseResponse(feature));
};
VirbControlForm.prototype.virbControlDispatchEvent = function (eventName, eventObject) {
    var eventCustom = new CustomEvent(eventName, {detail: eventObject});
    window.document.dispatchEvent(eventCustom);
};
VirbControlForm.prototype.onInputClick = function (e) {
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
            );
            console.log('Controlling the device\t' + JSON.stringify(controlCommand));
            this.virbControlDispatchEvent(EVENT_INPUT_CLICK, controlCommand);
            this.disableAllInputs(true);
        } else if (elemTargetName == 'export-status') {
            this.virbControlDispatchEvent(EVENT_EXPORT_HISTORY);
        }
    } else {
        if (elemTargetType == 'checkbox') {
            value = +elemTargetChecked + '';
        };
        if (elemTargetType == 'radio') {
            value = elemTargetValue;
        };
        COMMAND.UPDATE.feature = elemTargetName;
        COMMAND.UPDATE.value = value;
        console.log('Updating the feature\t' + JSON.stringify(COMMAND.UPDATE));
        this.virbControlDispatchEvent(EVENT_INPUT_CLICK, COMMAND.UPDATE);
        this.disableAllInputs(true);
    };
};
VirbControlForm.prototype.parseResponse = function (response) {
    var
        that = this,
        fragment = document.createDocumentFragment()
    ;
    // debugger;
    switch (+response.type) {
        case 1:
            var
                radio, label, paragraph,
                fieldset = document.createElement('fieldset'),
                legend = document.createElement('legend')
            ;
            legend.textContent = response.feature;
            fieldset.appendChild(legend);
            response.options.forEach(function (optionName, index) {
                paragraph = document.createElement('p');
                radio = document.createElement('input');
                label = document.createElement('label');
                radio.setAttribute('type', 'radio');
                radio.setAttribute('id', response.feature + '-' + optionName);
                radio.setAttribute('value', optionName);
                radio.setAttribute('name', response.feature);
                radio.addEventListener(EVENT_CLICK, that._bindOnInputClick, false);
                radio.addEventListener(EVENT_TAP, that._bindOnInputClick, false);
                (optionName == response.value) && radio.setAttribute('checked', 'true');
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
            (response.value == response.enabled) && checkbox.setAttribute('checked', 'true');
            checkbox.setAttribute('value', response.feature);
            checkbox.addEventListener(EVENT_CLICK, that._bindOnInputClick, false);
            checkbox.addEventListener(EVENT_TAP, that._bindOnInputClick, false);
            label.textContent = response.feature;
            label.setAttribute('for', response.feature);
            paragraph.appendChild(checkbox);
            paragraph.appendChild(label);
            fragment.appendChild(paragraph);
            break;
    };
    return fragment;
};