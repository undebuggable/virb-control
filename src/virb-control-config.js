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
var
    CONFIG = {
        HTTP_METHOD_POST: 'POST',
        HTTP_CONTENT_TYPE: 'Content-Type',
        HTTP_CONTENT_LENGTH: 'Content-Length',
        COMMAND: {
            FEATURES: {"command": "features"},
//FEATURES: "mediaDirList",
            UPDATE: {"command": "updateFeature", "feature": null, "value": null},
            RECORD_START: {"command": "startRecording"},
            RECORD_STOP: {"command": "stopRecording"},
            STATUS: {"command": "status"},
            INFO: {"command": "deviceInfo"},
            PREVIEW: {"command": "livePreview", "streamType": "rtp"},
            PICTURE: {"command": "snapPicture", "selfTimer": 0}
        },

        MIME_JSON: 'application/json',

        EVENT_EXPORT_HISTORY: 'virb-control-export-history',
        EVENT_INPUT_CLICK: 'virb-control-input-click',
        EVENT_GET_COMPLETE: 'virb-control-get-complete',
        EVENT_SET_COMPLETE: 'virb-control-set-complete',
        EVENT_CLICK: 'click',
        EVENT_TAP: 'tap',
        EVENT_STATE_CHANGE: 'readystatechange',
        EVENT_LOAD: 'load',

        EXCEPTION: {
            WINDOW_NOT_FOUND: 'The browser window not found',
            RESPONSE_EMPTY: 'Waiting for non-empty response'
        },
        ID: {
            FORM: 'virb-control-form',
            DEVICE_ONOFF: 'device-features-onoff',
            ELEM_DEVICE_MULTIOPTION: 'device-features-multioption',
            ELEM_DEVICE_STATUS: 'device-status',
            ELEM_DEVICE_INFO: 'device-info',
            ELEM_DEVICE_PREVIEW: 'device-preview',
            DEVICE_CONTROL: 'device-features-control'
        },
        CSS: {
            DETECTING: 'detecting'
        },
        KEY: {
            FEATURE_SUMMARIES: 'optionSummaries',
            STATUS_TIMER: 'selfTimer',
            STATUS_SPACE_AVAILABLE: 'availableSpace',
            STATUS_SPACE_TOTAL: 'totalSpace',
            STATUS_TIME_RECORDING: 'recordingTime',
            STATUS_TIME_REMAINING: 'recordingTimeRemaining'
        },
        UI: {
            STREAMING_NOTICE: 'Starting the streaming will stop recording and repeated pictures',
            DETECTING: 'Detecting the camera...',
            FAILED_TO_UPDATE: 'Failed to update the command'
        },
        RESPONSE: {
            FEATURES: "features",
            STATUS: "status",
            INFO: "deviceInfo",
            PREVIEW: "url"
        },
        URL_VIRB: "http://192.168.0.1/virb",
        PROFILES: {
            VIDEO_CAR: [
                {gps: "whenrecording"},
                {recordingLED: "1"},
                {videoMode: "1080p"},
                {fieldOfView: "ultraZoom"},
                {videoLoop: "30"},
                {microphone: "1"},
                {stabilization: "1"},
                {rotation: "1"}
            ],
            VIDEO_NORMAL: [],
            TIMELAPSE_VIDEO: [
                {gps: "off"},
                {recordingLED: "0"},
                {videoMode: "1080p"},
                {fieldOfView: "ultraZoom"},
                {videoLoop: "0"},
                {microphone: "0"},
                {imageSize: "4664x3496"},
                {stabilization: "0"},
                {rotation: "1"}
            ],
            TIMELAPSE_PHOTO: []
        }
    }
;

CONFIG.HTTP_METHOD_DEFAULT = CONFIG.HTTP_METHOD_POST;
CONFIG.FETCH_HEADERS = new Headers({
    // 'Content-Type': CONFIG.MIME_JSON,
    'Accept': CONFIG.MIME_JSON
});
CONFIG.FETCH_INIT = {
    method: CONFIG.HTTP_METHOD_DEFAULT,
    headers: CONFIG.FETCH_HEADERS,

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
};
CONFIG.FETCH_INIT_STATUS = {
    method: CONFIG.HTTP_METHOD_DEFAULT,
    headers: CONFIG.FETCH_HEADERS,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(CONFIG.COMMAND.STATUS)
};
CONFIG.FETCH_INIT_INFO = {
    method: CONFIG.HTTP_METHOD_DEFAULT,
    headers: CONFIG.FETCH_HEADERS,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(CONFIG.COMMAND.INFO)
};
CONFIG.FETCH_INIT_PREVIEW = {
    method: CONFIG.HTTP_METHOD_DEFAULT,
    headers: CONFIG.FETCH_HEADERS,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(CONFIG.COMMAND.PREVIEW)
};
CONFIG.FETCH_INIT_FEATURES = {
    method: CONFIG.HTTP_METHOD_DEFAULT,
    headers: CONFIG.FETCH_HEADERS,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(CONFIG.COMMAND.FEATURES)
};
CONFIG.FETCH_INIT_SET = {
    method: CONFIG.HTTP_METHOD_DEFAULT,
    headers: CONFIG.FETCH_HEADERS,
    mode: 'cors',
    cache: 'default'
    //body: JSON.stringify(CONFIG.COMMAND.FEATURES)
};
export default CONFIG;
