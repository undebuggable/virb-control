function VirbControl (_window) {
    var
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
    };
    function exportStatusHistory () {
        var csv = '';
        // debugger;
        statusTrack.forEach(function (statusItem) {
        });
        statusTrack = [];
    };
    function detecting () {
        removeEventListeners();
        virbControlForm.clear();
        virbControlStatus.clear();
        document.body.classList.add(CSS.DETECTING);
    };
    function onStateChangeStatus () {
        if (xhrStatus.readyState == XMLHttpRequest.DONE) {
            var
                responseJSON
                ;
            if (!xhrStatus.responseText.length) {
                isDetecting = true;
                detecting();
                virbControlForm.showAllFieldsets(false);
            } else {
                //debugger;
                if (isDetecting) {
                    //debugger;
                    document.body.classList.remove(CSS.DETECTING);
                    Array.prototype.forEach.call(
                        document.getElementsByTagName('input'),
                        function (input) {
                            input.addEventListener(EVENT_CLICK, virbControlForm.onInputClick, false);
                            input.addEventListener(EVENT_TAP, virbControlForm.onInputClick, false);
                        });
                    requestGet(COMMAND.INFO);
                    requestGet(COMMAND.PREVIEW);
                    requestGet(COMMAND.FEATURES);
                    isDetecting = false;
                };
                responseJSON = JSON.parse(xhrStatus.responseText);
                responseJSON.isoTime = (new Date()).toISOString();
                statusTrack.push(responseJSON);
                virbControlStatus.elemStatus.innerHTML = '';
                virbControlStatus.renderConfigurationFeatureUI(responseJSON, virbControlStatus.elemStatus);
            }
        } else {
            //detecting();
        }
    };
    function onStateChangeGet () {
        if (this.readyState == XMLHttpRequest.DONE) {
            console.log('onStateChangeGet\n' + this.responseText)
            if (!this.responseText.length) return;
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
            };
        }
    };
    function onStateChangeSet () {
        if (this.readyState == XMLHttpRequest.DONE) {
            console.log('onStateChangeGet\n' + this.responseText)
            if (!this.responseText.length) return;
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
                    alert(UI.FAILED_TO_UPDATE)
                    break;
                case 1:
                    break;
            };
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
            };
        }
    };
    function requestSet (e) {
        var
            xhrFeatures = new XMLHttpRequest(),
            command = e.detail
        ;
        xhrFeatures.addEventListener(EVENT_STATE_CHANGE, onStateChangeSet, false);
        xhrFeatures.open(HTTP_METHOD_DEFAULT, URL, true);
        xhrFeatures.setRequestHeader(HTTP_CONTENT_TYPE, MIME_JSON);
        xhrFeatures.send(JSON.stringify(command));
    };
    function requestGet (command) {
        var xhrFeatures = new XMLHttpRequest();
        xhrFeatures.addEventListener(EVENT_STATE_CHANGE, onStateChangeGet, false);
        xhrFeatures.open(HTTP_METHOD_DEFAULT, URL, true);
        xhrFeatures.setRequestHeader(HTTP_CONTENT_TYPE, MIME_JSON);
        xhrFeatures.send(JSON.stringify(command));
    }
    function watchStatus() {
        xhrStatus.open(HTTP_METHOD_DEFAULT, URL, true);
        xhrStatus.setRequestHeader(HTTP_CONTENT_TYPE, MIME_JSON);
        xhrStatus.send(JSON.stringify(COMMAND.STATUS));
    };
    (function () {
        publicInterface = {
            watchStatus: watchStatus,
            xhrStatus: xhrStatus
        };
        document.addEventListener(EVENT_INPUT_CLICK, requestSet);
        document.addEventListener(EVENT_EXPORT_HISTORY, exportStatusHistory);
        xhrStatus.addEventListener(EVENT_STATE_CHANGE, onStateChangeStatus, false);
    })();
    return publicInterface;
};
(function init (_window) {
    var window = _window;
    function onWindowLoad () {
        var virbControl = new VirbControl(window);
        WATCH_STATUS_INTERVALID = setInterval(virbControl.watchStatus, WATCH_STATUS_PERIOD);
    };
    (function init () {
        window.addEventListener(EVENT_LOAD, onWindowLoad);
    })();
})(window);