import CONFIG from './virb-control-config.js'
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
                input.removeEventListener(CONFIG.EVENT_CLICK, virbControlForm.onInputClick, false);
                input.removeEventListener(CONFIG.EVENT_TAP, virbControlForm.onInputClick, false);
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
        document.body.classList.add(CONFIG.CSS.DETECTING);
    }
    function requestSet (e) {
        //debugger;
        // if (NON_BLOCKING.IS_GETTING || NON_BLOCKING.IS_SETTING) return;
        NON_BLOCKING.IS_SETTING = true;
        var
            requestSet,
            command = e.detail
        ;
        CONFIG.FETCH_INIT_SET.body = JSON.stringify(command);
        requestSet = new Request(CONFIG.URL_VIRB, CONFIG.FETCH_INIT_SET);
        fetch(requestSet).then(function(response) {
            //debugger;
            if (response.ok) {
                var
                    contentType = response.headers.get(CONFIG.HTTP_CONTENT_TYPE),
                    contentLength = +response.headers.get(CONFIG.HTTP_CONTENT_LENGTH)
                    ;
                if(
                    contentType && contentType.includes(CONFIG.MIME_JSON)
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
        var requestStatus = new Request(CONFIG.URL_VIRB, CONFIG.FETCH_INIT_STATUS);
        fetch(requestStatus).then(function(response) {
            //debugger;
            if (response.ok) {

                var
                    contentType = response.headers.get(CONFIG.HTTP_CONTENT_TYPE)
                    //contentLength = +response.headers.get(CONFIG.HTTP_CONTENT_LENGTH)
                ;
                if(
                    contentType && contentType.includes(CONFIG.MIME_JSON)
                ) {
                    return response.json();
                } else {
                    console.log('watchStatus\tok');
                }


                /*
                [NOTE][FIXME] Be permissive, the camera easily gets overwhelmed and confused
                 */
                // return response.json();

            } else {
                console.log('watchStatus\tnot ok\t' + response.status);
            }
        }).then(function(responseJson) {
            //debugger;
            if (!responseJson) throw new Error(CONFIG.EXCEPTION.RESPONSE_EMPTY);
            if (isDetecting) {
                document.body.classList.remove(CONFIG.CSS.DETECTING);
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
            if (CONFIG.RESPONSE.FEATURES in responseJson) {
                eventListenersRemove();
                virbControlForm.clear();
                responseJson[CONFIG.RESPONSE.FEATURES].forEach(function (feature) {
                    virbControlForm.renderConfigurationFeatureUI(feature);
                });
                virbControlForm.showAllFieldsets(true);
            }
            if (CONFIG.RESPONSE.INFO in responseJson) {
                eventListenersRemove();
                virbControlStatus.elemInfo.innerHTML = '';
                responseJson[CONFIG.RESPONSE.INFO].forEach(function (feature) {
                    virbControlStatus.renderConfigurationFeatureUI(feature, virbControlStatus.elemInfo);
                });
            }
            if (CONFIG.RESPONSE.PREVIEW in responseJson) {
                eventListenersRemove();
                virbControlStatus.elemPreview.innerHTML = '';
                var
                    previewUrl = document.createElement('a'),
                    notice = document.createElement('span')
                ;
                previewUrl.title = responseJson[CONFIG.RESPONSE.PREVIEW];
                previewUrl.textContent = responseJson[CONFIG.RESPONSE.PREVIEW];
                previewUrl.href = responseJson[CONFIG.RESPONSE.PREVIEW];
                virbControlStatus.elemPreview.appendChild(previewUrl);
                notice.textContent = ' (' + CONFIG.UI.STREAMING_NOTICE + ')';
                virbControlStatus.elemPreview.appendChild(notice);
            }
        } else {
            console.log('parseResponseConfiguration result error');
        }
    }
    function fetchAll() {
        // debugger;
        NON_BLOCKING.IS_GETTING = true;
        var
            requestFeatures = new Request(CONFIG.URL_VIRB, CONFIG.FETCH_INIT_FEATURES),
            requestInfo = new Request(CONFIG.URL_VIRB, CONFIG.FETCH_INIT_INFO),
            requestPreview = new Request(CONFIG.URL_VIRB, CONFIG.FETCH_INIT_PREVIEW)
        ;
        Promise.all([
            fetch(requestInfo),
            fetch(requestPreview),
            fetch(requestFeatures)
        ]).then(function (responsePromises) {
            Promise.all(
                responsePromises.map(function(responsePromiseItem) {
                    var contentType = responsePromiseItem.headers.get(CONFIG.HTTP_CONTENT_TYPE);
                    if (
                        responsePromiseItem.ok &&
                        contentType &&
                        contentType.includes(CONFIG.MIME_JSON)
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
    (function constructor () {
        publicInterface = {
            // requestSet: requestSet,
            // exportStatusHistory: exportStatusHistory,
            // watchStatus: watchStatus,
            // detecting: detecting
        };
        document.addEventListener(CONFIG.EVENT_INPUT_CLICK, requestSet);
        document.addEventListener(CONFIG.EVENT_EXPORT_HISTORY, exportStatusHistory);
        detecting();
        WATCH_STATUS_INTERVAL_ID = setInterval(watchStatus, WATCH_STATUS_INTERVAL);
    })();
    return publicInterface;
}
