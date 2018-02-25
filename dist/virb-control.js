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
})(window);;var

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
  HTTP_CONTENT_LENGTH = 'Content-Length',
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

  MIME_JSON = 'application/json',

  FETCH_HEADERS = new Headers({
    'Content-Type': MIME_JSON
  }),
  FETCH_INIT = {
    method: HTTP_METHOD_DEFAULT,
    headers: FETCH_HEADERS,

    /*
    Firefox
    Necessary to enable the cors mode for Firefox
     */
    mode: 'cors',

    /*
    Chromium:
     virb-control.html:1 Fetch API cannot load http://192.168.0.1/virb. Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'null' is therefore not allowed access. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
     virb-control.js:123 watchStatus catch	Failed to fetch
     */
    //mode: 'no-cors',

    cache: 'default'
  },
  FETCH_INIT_STATUS = {
    method: HTTP_METHOD_DEFAULT,
    headers: FETCH_HEADERS,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(COMMAND.STATUS)
  },
  FETCH_INIT_INFO = {
    method: HTTP_METHOD_DEFAULT,
    headers: FETCH_HEADERS,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(COMMAND.INFO)
  },
  FETCH_INIT_PREVIEW = {
    method: HTTP_METHOD_DEFAULT,
    headers: FETCH_HEADERS,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(COMMAND.PREVIEW)
  },
  FETCH_INIT_FEATURES = {
    method: HTTP_METHOD_DEFAULT,
    headers: FETCH_HEADERS,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(COMMAND.FEATURES)
  },
  FETCH_INIT_SET = {
    method: HTTP_METHOD_DEFAULT,
    headers: FETCH_HEADERS,
    mode: 'cors',
    cache: 'default'
    //body: JSON.stringify(COMMAND.FEATURES)
  },

  EVENT_EXPORT_HISTORY = 'virb-control-export-history',
  EVENT_INPUT_CLICK = 'virb-control-input-click',
  EVENT_GET_COMPLETE = 'virb-control-get-complete',
  EVENT_SET_COMPLETE = 'virb-control-set-complete',
  EVENT_CLICK = 'click',
  EVENT_TAP = 'tap',
  EVENT_STATE_CHANGE = 'readystatechange',
  EVENT_LOAD = 'load',

  EXCEPTION = {
    WINDOW_NOT_FOUND: 'The browser window not found',
    RESPONSE_EMPTY: 'Waiting for non-empty response'
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
;// import CONFIG from './virb-control-config.js'

export default function VirbControlForm (_window) {
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
};// import CONFIG from './virb-control-config.js'

export default function VirbControlRecord (_window) {
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
};// import CONFIG from './virb-control-config.js'

export default function VirbControlStatus (_window) {
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
};;// import CONFIG from './virb-control-config.js'
import VirbControlRecord from './virb-control-record.js'
import VirbControlForm from './virb-control-form.js'
import VirbControlStatus from './virb-control-status.js'

export default function VirbControl (_window) {
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
        //xhrStatus = new XMLHttpRequest(),
        virbControlRecord = new VirbControlRecord(window),
        virbControlForm = new VirbControlForm(window),
        virbControlStatus = new VirbControlStatus(window)
    ;
    function eventListenersRemove () {
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
         //debugger;
        statusTrack.forEach(function (statusItem) {
        });
        window.open(
            'data:text/html;charset=UTF-8,'.concat(
                encodeURIComponent(JSON.stringify(statusTrack, null, 2))
            ),
            '_blank',
            'location=no,height=0,width=0,scrollbars=no,status=no'
        );
        statusTrack = [];
    }
    function detecting () {
        isDetecting = true;
        eventListenersRemove();
        virbControlForm.clear();
        virbControlForm.showAllFieldsets(false);
        virbControlStatus.clear();
        document.body.classList.add(CSS.DETECTING);
    }
    function requestSet (e) {
        //debugger;
        // if (NON_BLOCKING.IS_GETTING || NON_BLOCKING.IS_SETTING) return;
        NON_BLOCKING.IS_SETTING = true;
        var
            requestSet,
            command = e.detail
        ;
        FETCH_INIT_SET.body = JSON.stringify(command);
        requestSet = new Request(URL_VIRB, FETCH_INIT_SET);
        fetch(requestSet).then(function(response) {
            //debugger;
            if (response.ok) {
                var
                    contentType = response.headers.get(HTTP_CONTENT_TYPE),
                    contentLength = +response.headers.get(HTTP_CONTENT_LENGTH)
                    ;
                if(
                    contentType && contentType.includes(MIME_JSON)
                ) {
                    return response.json();
                } else {
                    console.log('requestSet\tok');
                }
            } else {
                console.log('requestSet\tnot ok');
            }
        }).then(function(responseJson) {
            NON_BLOCKING.IS_SETTING = false;
            virbControlRecord.disableAllInputs(false);
            parseResponseConfiguration(responseJson);
        }).catch(function(error) {
            NON_BLOCKING.IS_SETTING = false;
            virbControlRecord.disableAllInputs(false);
            console.log('requestSet catch\t' + error.message);
        });
    }
    function watchStatus() {
        //debugger;
        if (NON_BLOCKING.IS_GETTING || NON_BLOCKING.IS_SETTING) return;
        var requestStatus = new Request(URL_VIRB, FETCH_INIT_STATUS);
        fetch(requestStatus).then(function(response) {
            //debugger;
            if (response.ok) {
                var
                    contentType = response.headers.get(HTTP_CONTENT_TYPE)
                    //contentLength = +response.headers.get(HTTP_CONTENT_LENGTH)
                ;
                if(
                    contentType && contentType.includes(MIME_JSON)
                ) {
                    return response.json();
                } else {
                    console.log('watchStatus\tok');
                }
            } else {
                console.log('watchStatus\tnot ok\t' + response.status);
            }
        }).then(function(responseJson) {
            //debugger;
            if (!responseJson) throw new Error(EXCEPTION.RESPONSE_EMPTY);
            if (isDetecting) {
                document.body.classList.remove(CSS.DETECTING);
                fetchAll();
                isDetecting = false;
            }
            parseResponseStatus(responseJson);
        }).catch(function(error) {
            //debugger;
            detecting();
            console.log('watchStatus catch\t' + error.message);
        });
    }
    function parseResponseStatus (responseJson) {
        //debugger;
        if (+responseJson.result == 1) {
            var elemStatus = virbControlStatus.elemStatus;
            responseJson.isoTime = (new Date()).toISOString();
            statusTrack.push(responseJson);
            while (elemStatus.childNodes.length) elemStatus.removeChild(elemStatus.firstChild);
            virbControlStatus.renderConfigurationFeatureUI(responseJson, virbControlStatus.elemStatus);
        } else {
            console.log('parseResponseStatus result error');
        }
    }
    function parseResponseConfiguration (responseJson) {
        //debugger;
        if (+responseJson.result == 1) {
            if (RESPONSE.FEATURES in responseJson) {
                eventListenersRemove();
                virbControlForm.clear();
                responseJson[RESPONSE.FEATURES].forEach(function (feature) {
                    virbControlForm.renderConfigurationFeatureUI(feature);
                });
                virbControlForm.showAllFieldsets(true);
            }
            if (RESPONSE.INFO in responseJson) {
                eventListenersRemove();
                virbControlStatus.elemInfo.innerHTML = '';
                responseJson[RESPONSE.INFO].forEach(function (feature) {
                    virbControlStatus.renderConfigurationFeatureUI(feature, virbControlStatus.elemInfo);
                });
            }
            if (RESPONSE.PREVIEW in responseJson) {
                eventListenersRemove();
                virbControlStatus.elemPreview.innerHTML = '';
                var
                    previewUrl = document.createElement('a'),
                    notice = document.createElement('span')
                ;
                previewUrl.title = responseJson[RESPONSE.PREVIEW];
                previewUrl.textContent = responseJson[RESPONSE.PREVIEW];
                previewUrl.href = responseJson[RESPONSE.PREVIEW];
                virbControlStatus.elemPreview.appendChild(previewUrl);
                notice.textContent = ' (' + UI.STREAMING_NOTICE + ')';
                virbControlStatus.elemPreview.appendChild(notice);
            }
        } else {
            console.log('parseResponseConfiguration result error');
        }
    }
    function fetchAll() {
        NON_BLOCKING.IS_GETTING = true;
        var
            requestFeatures = new Request(URL_VIRB, FETCH_INIT_FEATURES),
            requestInfo = new Request(URL_VIRB, FETCH_INIT_INFO),
            requestPreview = new Request(URL_VIRB, FETCH_INIT_PREVIEW)
        ;
        Promise.all([
            fetch(requestInfo),
            fetch(requestPreview),
            fetch(requestFeatures)
        ]).then(function (responsePromises) {
            Promise.all(
                responsePromises.map(function(responsePromiseItem) {
                    var contentType = responsePromiseItem.headers.get(HTTP_CONTENT_TYPE);
                    if (
                        responsePromiseItem.ok &&
                        contentType &&
                        contentType.includes(MIME_JSON)
                    ) {
                        return responsePromiseItem.json();
                    } else {
                        console.log('fetchAll\tnot ok');
                    }
                })
            ).then(function(responseAllJsons) {
                NON_BLOCKING.IS_GETTING = false;
                responseAllJsons.forEach(function (responseJson) {
                    parseResponseConfiguration(responseJson);
                });
            }).catch(function (error) {
                NON_BLOCKING.IS_GETTING = false;
                console.log('fetchAll catch\tinner\t' + error.message);
            })
        }).catch(function (error) {
            NON_BLOCKING.IS_GETTING = false;
            console.log('fetchAll catch\touter\t' + error.message);
        });
    }
    (function () {
        publicInterface = {
            // watchStatus: watchStatus,
            // xhrStatus: xhrStatus
        };
        document.addEventListener(EVENT_INPUT_CLICK, requestSet);
        document.addEventListener(EVENT_EXPORT_HISTORY, exportStatusHistory);
        //xhrStatus.addEventListener(EVENT_STATE_CHANGE, onStateChangeStatus, false);
        detecting();
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
