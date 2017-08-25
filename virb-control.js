function VirbControl () {
    var
        publicInterface = {},
        statusTrack = [],
        isDetecting = true,
        xhrStatus = new XMLHttpRequest(),
        virbControlForm = new VirbControlForm(document.getElementById(ID.FORM)),
        virbControlStatus = new VirbControlStatus(document)
    ;
    function removeEventListeners () {
        var inputs = document.getElementsByTagName('input');
        Array.prototype.forEach.call(
            inputs,
            function (input) {
                //Remove event listeners only from dynamically created inputs
                if (input.type == 'button') return;
                input.removeEventListener('click', virbControlForm._bindOnInputClick, false);
                input.removeEventListener('tap', virbControlForm._bindOnInputClick, false);
            });
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
                            input.addEventListener('click', virbControlForm._bindOnInputClick, false);
                            input.addEventListener('tap', virbControlForm._bindOnInputClick, false);
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
                virbControlForm.renderConfigurationFeatureUI(responseJSON, virbControlStatus.elemStatus);
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
                        virbControlForm.elemOnoff.innerHTML = '';
                        virbControlStatus.elemFeatures.innerHTML = '';
                        response.features.forEach(function (feature) {
                            +feature.type == 1 &&
                            virbControlForm.renderConfigurationFeatureUI(feature, virbControlStatus.elemFeatures);
                            +feature.type == 2 &&
                            virbControlForm.renderConfigurationFeatureUI(feature, virbControlForm.elemOnoff);
                        });
                        virbControlForm.showAllFieldsets(true);
                        break;
                    case RESPONSE.INFO:
                        removeEventListeners();
                        virbControlStatus.elemInfo.innerHTML = '';
                        response.deviceInfo.forEach(function (feature) {
                            virbControlForm.renderConfigurationFeatureUI(feature, virbControlStatus.elemInfo);
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
                    virbControlForm.elemOnoff.innerHTML = '';
                    virbControlStatus.elemFeatures.innerHTML = '';
                    response.features.forEach(function (feature) {
                        +feature.type == 1 &&
                        virbControlForm.renderConfigurationFeatureUI(feature, virbControlStatus.elemFeatures);
                        +feature.type == 2 &&
                        virbControlForm.renderConfigurationFeatureUI(feature, virbControlForm.elemOnoff);
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
        xhrFeatures.addEventListener('readystatechange', onStateChangeSet, false);
        xhrFeatures.open('POST', URL, true);
        xhrFeatures.setRequestHeader('Content-Type', 'application/json');
        xhrFeatures.send(JSON.stringify(command));
    };
    function requestGet (command) {
        var xhrFeatures = new XMLHttpRequest();
        xhrFeatures.addEventListener('readystatechange', onStateChangeGet, false);
        xhrFeatures.open('POST', URL, true);
        xhrFeatures.setRequestHeader('Content-Type', 'application/json');
        xhrFeatures.send(JSON.stringify(command));
    }
    function watchStatus() {
        xhrStatus.addEventListener('readystatechange', onStateChangeStatus, false);
        xhrStatus.open('POST', URL, true);
        xhrStatus.setRequestHeader('Content-Type', 'application/json');
        xhrStatus.send(JSON.stringify(COMMAND.STATUS));
    };
    (function () {
        publicInterface = {
            watchStatus: watchStatus
        };
        window.document.addEventListener(EVENT_INPUT_CLICK, requestSet);
        window.document.addEventListener(EVENT_EXPORT_HISTORY, exportStatusHistory);
    })();
    return publicInterface;
};
(function init () {
    function onWindowLoad () {
        var virbControl = new VirbControl();
        virbControl.watchStatus();
        WATCH_STATUS_INTERVALID = setInterval(virbControl.watchStatus, WATCH_STATUS_PERIOD);
    }
    (function init () {
        window.addEventListener('load', onWindowLoad);
    })();
})();