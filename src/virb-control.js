function VirbControl (_window) {
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
                    console.log('requestSet\t' + '0000000000000000000');
                }
            } else {
                console.log('requestSet\t' + '11111111111111111111');
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
                    console.log('watchStatus\t' + '22222222222222222222222');
                }
            } else {
                console.log('watchStatus\t' + response.status + '\t33333333333333333333');
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
                        console.log('fetchAll\t' + '44444444444444444444');
                    }
                })
            ).then(function(responseAllJsons) {
                NON_BLOCKING.IS_GETTING = false;
                responseAllJsons.forEach(function (responseJson) {
                    parseResponseConfiguration(responseJson);
                });
            }).catch(function (error) {
                NON_BLOCKING.IS_GETTING = false;
                console.log('fetchAll catch 5555555555555555\t' + error.message);
            })
        }).catch(function (error) {
            NON_BLOCKING.IS_GETTING = false;
            console.log('fetchAll catch 6666666666666666666\t' + error.message);
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
