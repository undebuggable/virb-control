function VirbControlForm (_elemForm, requestSet) {
    if (!_elemForm) {
      throw new Error(EXCEPTION.FORM_NOT_FOUND);
    } else {
        var
            self = this,
            elemForm = _elemForm
        ;
        self.elemOnoff = elemForm.querySelector('#'+ID.DEVICE_ONOFF);
        //[FIXME] Do this with custom event bubbled to VirbControl instance
        self.requestSet = requestSet;
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
};
VirbControlForm.prototype.renderConfigurationFeatureUI = function (feature, elemParent) {
    elemParent.appendChild(this.parseResponse(feature));
};
VirbControlForm.prototype.secondsToTimeString = function (seconds) {
    var minutes, hours;
    hours = Math.floor(seconds/3600);
    minutes = Math.floor(seconds/60) - hours * 60;
    seconds = seconds - hours * 3600 - minutes * 60;
    return ''.concat(hours + 'h ', minutes + 'min ', seconds + 'sec');
};
VirbControlForm.prototype.kilobytesToSpaceString = function (kib) {
    var mib, gib;
    gib = Math.floor(kib/(1024*1024));
    mib = Math.floor(kib/1024) - gib * 1024;
    kib = kib - gib * 1024 * 1024 - mib * 1024;
    return ''.concat(gib + 'GiB ', mib + 'MiB ', kib + 'KiB');
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
            this.requestSet(controlCommand);
            this.disableAllInputs(true);
        } else if (elemTargetName == 'export-status') {
            //[FIXME] Do this with custom event bubbled to VirbControl instance
            // exportStatusHistory();
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
        this.requestSet(COMMAND.UPDATE);
        this.disableAllInputs(true);
    };
};
VirbControlForm.prototype.parseResponse = function (response) {
    var
        that = this,
        fragment = document.createDocumentFragment()
    ;
    //debugger;
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
                radio.addEventListener('click', that._bindOnInputClick, false);
                radio.addEventListener('tap', that._bindOnInputClick, false);
                (optionName == response.value) && radio.setAttribute('checked', 'true')
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
            checkbox.addEventListener('click', that._bindOnInputClick, false);
            checkbox.addEventListener('tap', that._bindOnInputClick, false);
            label.textContent = response.feature;
            label.setAttribute('for', response.feature);
            paragraph.appendChild(checkbox);
            paragraph.appendChild(label);
            fragment.appendChild(paragraph);
            break;
        default:
            var
                dd, dt, ol, seconds, minutes, hours, mib, gib, kib,
                ol = document.createElement('ol')
            ;
            Object.keys(response).forEach(function (key) {
                dt = document.createElement('dt');
                dd = document.createElement('dd');
                dt.textContent = key;
                switch (key) {
                    case KEY.STATUS_SPACE_AVAILABLE:
                        dd.textContent = that.kilobytesToSpaceString(+response[key]);
                        break;
                    case KEY.STATUS_SPACE_TOTAL:
                        dd.textContent = that.kilobytesToSpaceString(+response[key]);
                        break;
                    case KEY.STATUS_TIME_RECORDING:
                        dd.textContent = that.secondsToTimeString(+response[key]);
                        break;
                    case KEY.STATUS_TIME_REMAINING:
                        dd.textContent = that.secondsToTimeString(+response[key]);
                        break;
                    default:
                        dd.textContent = response[key];
                        break;
                };
                ol.appendChild(dt)
                ol.appendChild(dd)
            });
            fragment.appendChild(ol);
            break;
    };
    return fragment;
};