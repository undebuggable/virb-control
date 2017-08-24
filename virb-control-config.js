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

  ID = {
    DEVICE_ONOFF: 'device-features-onoff',
    DEVICE_MULTIOPTION: 'device-features-multioption',
    DEVICE_STATUS: 'device-status',
    DEVICE_INFO: 'device-info',
    DEVICE_PREVIEW: 'device-preview',
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
  URL = "http://192.168.0.1/virb",
  PROFILES = {
    VIDEO_CAR: [{gps:"whenrecording"},{recordingLED:"1"},{videoMode:"1080p"},{fieldOfView:"ultraZoom"},{videoLoop:"30"},{microphone:"1"},{stabilization:"1"},{rotation:"1"}],
    VIDEO_NORMAL: [],
    TIMELAPSE_VIDEO: [{gps:"off"},{recordingLED:"0"},{videoMode:"1080p"},{fieldOfView:"ultraZoom"},{videoLoop:"0"},{microphone:"0"},{"imageSize":"4664x3496"},{stabilization:"0"},{rotation:"1"}],
    TIMELAPSE_PHOTO: []
  },
  WATCH_STATUS_PERIOD = 1000,
  WATCH_STATUS_INTERVALID = null
;