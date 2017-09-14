var

/*
https://forums.garmin.com/archive/index.php/t-63326.html

It'd be nice if they explained the difference between "wide", "zoom 1", "zoom 2", and "ultra zoom" somewhere,
and they explained why image stabilization (sort of) works only with Ultra Zoom.

webbikeworld tested the field of view and wrote:

wide: '150 degrees',
zoom1: '110 degrees',
zoom2: '100 degrees',
ultraZoom: '90 degrees'

Wide: 150 degrees
Zoom 1: 110 degrees
Zoom 2: 100 degrees
Ultra Zoom: 90 degrees
*/

  HTTP_METHOD_POST = 'POST',
  HTTP_METHOD_DEFAULT = HTTP_METHOD_POST,
  HTTP_CONTENT_TYPE = 'Content-Type',

  MIME_JSON = 'application/json',

  EVENT_EXPORT_HISTORY = 'virb-control-export-history',
  EVENT_INPUT_CLICK = 'virb-control-input-click',
  EVENT_GET_COMPLETE = 'virb-control-get-complete',
  EVENT_SET_COMPLETE = 'virb-control-set-complete',
  EVENT_CLICK = 'click',
  EVENT_TAP = 'tap',
  EVENT_STATE_CHANGE = 'readystatechange',
  EVENT_LOAD = 'load',

  EXCEPTION = {
    WINDOW_NOT_FOUND: 'The browser window not found'
  },
  ID = {
    FORM: 'virb-control-form',
    DEVICE_ONOFF: 'device-features-onoff',
    ELEM_DEVICE_MULTIOPTION: 'device-features-multioption',
    ELEM_DEVICE_STATUS: 'device-status',
    ELEM_DEVICE_INFO: 'device-info',
    ELEM_DEVICE_PREVIEW: 'device-preview',
    DEVICE_CONTROL: 'device-features-control'
  },
  CSS = {
    DETECTING: 'detecting'
  },
  KEY = {
    FEATURE_SUMMARIES: 'optionSummaries',
    STATUS_TIMER: 'selfTimer',
    STATUS_SPACE_AVAILABLE: 'availableSpace',
    STATUS_SPACE_TOTAL: 'totalSpace',
    STATUS_TIME_RECORDING: 'recordingTime',
    STATUS_TIME_REMAINING: 'recordingTimeRemaining'
  },
  UI = {
    STREAMING_NOTICE: 'Starting the streaming will stop recording and repeated pictures',
    DETECTING: 'Detecting the camera...',
    FAILED_TO_UPDATE: 'Failed to update the command'
  },
  COMMAND = {
    FEATURES: {"command":"features"},
//FEATURES: "mediaDirList",
    UPDATE: {"command":"updateFeature","feature":null,"value":null},
    RECORD_START: {"command":"startRecording"},
    RECORD_STOP: {"command":"stopRecording"},
    STATUS: {"command":"status"},
    INFO: {"command":"deviceInfo"},
    PREVIEW: {"command":"livePreview","streamType":"rtp"},
    PICTURE: {"command":"snapPicture","selfTimer": 0}
  },
  RESPONSE = {
    FEATURES: "features",
    STATUS: "status",
    INFO: "deviceInfo",
    PREVIEW: "url"
  },
  URL_VIRB = "http://192.168.0.1/virb",
  PROFILES = {
    VIDEO_CAR: [{gps:"whenrecording"},{recordingLED:"1"},{videoMode:"1080p"},{fieldOfView:"ultraZoom"},{videoLoop:"30"},{microphone:"1"},{stabilization:"1"},{rotation:"1"}],
    VIDEO_NORMAL: [],
    TIMELAPSE_VIDEO: [
        {gps:"off"},{recordingLED:"0"},
        {videoMode:"1080p"},{fieldOfView:"ultraZoom"},
        {videoLoop:"0"},{microphone:"0"},
        {"imageSize":"4664x3496"},{stabilization:"0"},
        {rotation:"1"}
    ],
    TIMELAPSE_PHOTO: []
  }
;
;function VirbControlForm (_window) {
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
};function VirbControlStatus (_window) {
    if (!_window) {
        throw new Error(EXCEPTION.WINDOW_NOT_FOUND);
    } else {
        var
            self = this,
            elemDocument = _window.document
        ;
        self.elemDocument = elemDocument;
        self.elemStatus = elemDocument.querySelector('#' + ID.ELEM_DEVICE_STATUS);
        self.elemInfo = elemDocument.querySelector('#' + ID.ELEM_DEVICE_INFO);
        self.elemPreview = elemDocument.querySelector('#' + ID.ELEM_DEVICE_PREVIEW);
    }
}
VirbControlStatus.prototype.clear = function () {
    [this.elemStatus, this.elemPreview, this.elemInfo].forEach(function (elem) {
        while (elem.childNodes.length) elem.removeChild(elem.firstChild);
    });
    this.elemStatus.textContent = UI.DETECTING;
};
VirbControlStatus.prototype.renderConfigurationFeatureUI = function (feature, elemParent) {
    elemParent.appendChild(this.parseResponse(feature));
};
VirbControlStatus.prototype.secondsToTimeString = function (seconds) {
    var minutes, hours;
    hours = Math.floor(seconds/3600);
    minutes = Math.floor(seconds/60) - hours * 60;
    seconds = seconds - hours * 3600 - minutes * 60;
    return ''.concat(hours + 'h ', minutes + 'min ', seconds + 'sec');
};
VirbControlStatus.prototype.kilobytesToSpaceString = function (kib) {
    var mib, gib;
    gib = Math.floor(kib/(1024*1024));
    mib = Math.floor(kib/1024) - gib * 1024;
    kib = kib - gib * 1024 * 1024 - mib * 1024;
    return ''.concat(gib + 'GiB ', mib + 'MiB ', kib + 'KiB');
};
VirbControlStatus.prototype.parseResponse = function (response) {
    var
        that = this,
        fragment = that.elemDocument.createDocumentFragment()
    ;
    switch (+response.type) {
        default:
            var
                dd, dt,
                ol = that.elemDocument.createElement('ol')
            ;
            Object.keys(response).forEach(function (key) {
                dt = that.elemDocument.createElement('dt');
                dd = that.elemDocument.createElement('dd');
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
                }
                ol.appendChild(dt);
                ol.appendChild(dd);
            });
            fragment.appendChild(ol);
            break;
    }
    return fragment;
};;function VirbControl (_window) {
    var
        WATCH_STATUS_INTERVAL = 1352,
        WATCH_STATUS_INTERVAL_ID = null,
        NON_BLOCKING = {
            IS_GETTING: false,
            IS_SETTING: false
        },
        window = _window,
        document = window.document,
        publicInterface = {},
        statusTrack = [],
        isDetecting = true,
        xhrStatus = new XMLHttpRequest(),
        virbControlForm = new VirbControlForm(window),
        virbControlStatus = new VirbControlStatus(window)
    ;
    function removeEventListeners () {
        var inputs = document.getElementsByTagName('input');
        Array.prototype.forEach.call(
            inputs,
            function (input) {
                //Remove event listeners only from dynamically created inputs
                if (input.type == 'button') return;
                input.removeEventListener(EVENT_CLICK, virbControlForm.onInputClick, false);
                input.removeEventListener(EVENT_TAP, virbControlForm.onInputClick, false);
            }
        );
    }
    function exportStatusHistory () {
        var csv = '';
        // debugger;
        statusTrack.forEach(function (statusItem) {
        });
        statusTrack = [];
    }
    function detecting () {
        removeEventListeners();
        virbControlForm.clear();
        virbControlStatus.clear();
        document.body.classList.add(CSS.DETECTING);
    }
    function onStateChangeStatus () {
        if (xhrStatus.readyState == XMLHttpRequest.DONE) {
            var
                responseJSON,
                elemStatus = virbControlStatus.elemStatus
            ;
            if (!xhrStatus.responseText.length) {
                isDetecting = true;
                detecting();
                virbControlForm.showAllFieldsets(false);
            } else {
                // debugger;
                if (isDetecting) {
                    //debugger;
                    document.body.classList.remove(CSS.DETECTING);
                    Array.prototype.forEach.call(
                        document.getElementsByTagName('input'),
                        function (input) {
                            input.addEventListener(EVENT_CLICK, virbControlForm.onInputClick, false);
                            input.addEventListener(EVENT_TAP, virbControlForm.onInputClick, false);
                        }
                    );

                    //Don't overwhelm the camera...
                    //[FIXME] Make these calls synchronous
                    // i.e. invoke the next one after the previous one is completed, e.g. use Fetch API
                    setTimeout(requestGet.bind({'virbCommand': COMMAND.INFO}), 50);
                    setTimeout(requestGet.bind({'virbCommand': COMMAND.PREVIEW}), 350);
                    setTimeout(requestGet.bind({'virbCommand': COMMAND.FEATURES}), 650);

                    isDetecting = false;
                }
                responseJSON = JSON.parse(xhrStatus.responseText);
                responseJSON.isoTime = (new Date()).toISOString();
                statusTrack.push(responseJSON);
                while (elemStatus.childNodes.length) elemStatus.removeChild(elemStatus.firstChild);
                virbControlStatus.renderConfigurationFeatureUI(responseJSON, virbControlStatus.elemStatus);
            }
        } else {
            //detecting();
        }
    }
    function onStateChangeGet () {
        if (this.readyState == XMLHttpRequest.DONE) {
            console.log('onStateChangeGet\n' + this.responseText);
            if (!this.responseText.length) {
                NON_BLOCKING.IS_GETTING = false;
                return;
            }
            var
                responseCommand,
                response = JSON.parse(this.responseText),
                responseKeys = Object.keys(response)
            ;
            //debugger;
            if (+response.result == 1) {
                virbControlForm.disableAllInputs(false);
                //Assume only two properties: "result" and one more - command specific
                responseKeys.splice(responseKeys.indexOf('result'), 1);
                responseCommand = responseKeys[0];
                //debugger;
                switch (responseCommand) {
                    case RESPONSE.FEATURES:
                        removeEventListeners();
                        virbControlForm.clear();
                        response.features.forEach(function (feature) {
                            virbControlForm.renderConfigurationFeatureUI(feature);
                        });
                        virbControlForm.showAllFieldsets(true);
                        break;
                    case RESPONSE.INFO:
                        removeEventListeners();
                        virbControlStatus.elemInfo.innerHTML = '';
                        response.deviceInfo.forEach(function (feature) {
                            virbControlStatus.renderConfigurationFeatureUI(feature, virbControlStatus.elemInfo);
                        });
                        break;
                    case RESPONSE.PREVIEW:
                        removeEventListeners();
                        virbControlStatus.elemPreview.innerHTML = '';
                        var
                            previewUrl = document.createElement('a'),
                            notice = document.createElement('span')
                        ;
                        previewUrl.title = response.url;
                        previewUrl.textContent = response.url;
                        previewUrl.href = response.url;
                        virbControlStatus.elemPreview.appendChild(previewUrl);
                        notice.textContent = ' (' + UI.STREAMING_NOTICE + ')';
                        virbControlStatus.elemPreview.appendChild(notice);
                        break;
                }
            }
            NON_BLOCKING.IS_GETTING = false;
        }
    }
    function onStateChangeSet () {
        if (this.readyState == XMLHttpRequest.DONE) {
            console.log('onStateChangeGet\n' + this.responseText);
            if (!this.responseText.length) {
                NON_BLOCKING.IS_SETTING = false;
                return;
            }
            var
                responseCommand,
                response = JSON.parse(this.responseText),
                responseKeys = Object.keys(response)
            ;
            //debugger;
            virbControlForm.disableAllInputs(false);
            switch (+response.result) {
                case 0:
                    //debugger;
                    alert(UI.FAILED_TO_UPDATE);
                    break;
                case 1:
                    break;
            }
            //Assume only two properties: "result" and one more - command specific
            responseKeys.splice(responseKeys.indexOf('result'), 1);
            responseCommand = responseKeys[0];
            //debugger;
            switch (responseCommand) {
                case RESPONSE.FEATURES:
                    removeEventListeners();
                    virbControlForm.clear();
                    response.features.forEach(function (feature) {
                        virbControlForm.renderConfigurationFeatureUI(feature);
                    });
                    virbControlForm.showAllFieldsets(true);
                    break;
            }
            NON_BLOCKING.IS_SETTING = false;
        }
    }
    function requestSet (e) {
        // if (NON_BLOCKING.IS_GETTING || NON_BLOCKING.IS_SETTING) return;
        NON_BLOCKING.IS_SETTING = true;
        var
            xhrFeatures = new XMLHttpRequest(),
            command = e.detail
        ;
        xhrFeatures.addEventListener(EVENT_STATE_CHANGE, onStateChangeSet, false);
        xhrFeatures.open(HTTP_METHOD_DEFAULT, URL_VIRB, true);
        xhrFeatures.setRequestHeader(HTTP_CONTENT_TYPE, MIME_JSON);
        xhrFeatures.send(JSON.stringify(command));
    }
    function requestGet (command) {
        // if (NON_BLOCKING.IS_GETTING || NON_BLOCKING.IS_SETTING) return;
        NON_BLOCKING.IS_GETTING = true;
        if (!command) command = this.virbCommand;
        var xhrFeatures = new XMLHttpRequest();
        xhrFeatures.addEventListener(EVENT_STATE_CHANGE, onStateChangeGet, false);
        xhrFeatures.open(HTTP_METHOD_DEFAULT, URL_VIRB, true);
        xhrFeatures.setRequestHeader(HTTP_CONTENT_TYPE, MIME_JSON);
        xhrFeatures.send(JSON.stringify(command));
    }
    function watchStatus() {
        if (NON_BLOCKING.IS_GETTING || NON_BLOCKING.IS_SETTING) return;
        xhrStatus.open(HTTP_METHOD_DEFAULT, URL_VIRB, true);
        xhrStatus.setRequestHeader(HTTP_CONTENT_TYPE, MIME_JSON);
        xhrStatus.send(JSON.stringify(COMMAND.STATUS));
    }
    (function () {
        publicInterface = {
            // watchStatus: watchStatus,
            // xhrStatus: xhrStatus
        };
        document.addEventListener(EVENT_INPUT_CLICK, requestSet);
        document.addEventListener(EVENT_EXPORT_HISTORY, exportStatusHistory);
        xhrStatus.addEventListener(EVENT_STATE_CHANGE, onStateChangeStatus, false);
        WATCH_STATUS_INTERVAL_ID = setInterval(watchStatus, WATCH_STATUS_INTERVAL);
    })();
    return publicInterface;
}
(function init (_window) {
    var window = _window;
    function onWindowLoad () {
        var virbControl = new VirbControl(window);
    }
    (function init () {
        window.addEventListener(EVENT_LOAD, onWindowLoad);
    })();
})(window);
