var
  statusTrack = [],
  isDetecting = true,
  xhrStatus = new XMLHttpRequest(),
  elemStatus = document.getElementById(ID.DEVICE_STATUS),
  elemPreview = document.getElementById(ID.DEVICE_PREVIEW),
  elemInfo = document.getElementById(ID.DEVICE_INFO),
  elemOnoff = document.getElementById(ID.DEVICE_ONOFF),
  elemFeatures = document.getElementById(ID.DEVICE_MULTIOPTION)
;
function removeEventListeners () {
  Array.prototype.forEach.call(
    document.getElementsByTagName('input'),
    function (input) {
      //Remove event listeners only from dynamically created inputs
      if (input.type == 'button') return;
      input.removeEventListener('click', onInputClick, false);
      input.removeEventListener('tap', onInputClick, false);
  });
};
function disableAllInputs (isDisabled) {
  Array.prototype.forEach.call(
    document.getElementsByTagName('input'),
    function (input) {
      !!isDisabled && input.setAttribute('disabled', 'true');
      !isDisabled && input.removeAttribute('disabled');
  });
};
function showAllFieldsets (isVisible) {
  Array.prototype.forEach.call(
    document.getElementsByTagName('fieldset'),
    function (fieldset) {
      fieldset.style.display = !!isVisible ? 'block' : 'none';
    }
  )
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
  elemStatus.innerHTML = '';
  elemPreview.innerHTML = '';
  elemInfo.innerHTML = '';
  elemFeatures.innerHTML = '';
  elemOnoff.innerHTML = '';
  elemStatus.textContent = UI.DETECTING;
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
      showAllFieldsets(false);
    } else {
      //debugger;
      if (isDetecting) {
        //debugger;
        document.body.classList.remove(CSS.DETECTING);
        Array.prototype.forEach.call(
          document.getElementsByTagName('input'),
          function (input) {
            input.addEventListener('click', onInputClick, false);
            input.addEventListener('tap', onInputClick, false);
        });
        requestGet(COMMAND.INFO);
        requestGet(COMMAND.PREVIEW);
        requestGet(COMMAND.FEATURES);
        isDetecting = false;
      };
      responseJSON = JSON.parse(xhrStatus.responseText);
      responseJSON.isoTime = (new Date()).toISOString();
      statusTrack.push(responseJSON);
      elemStatus.innerHTML = '';
      elemStatus.appendChild(
        parseResponse(responseJSON)
      );
    }
  } else {
    //detecting();
  }
};
//function 
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
      disableAllInputs(false);
      //Assume only two properties: "result" and one more - command specific
      responseKeys.splice(responseKeys.indexOf('result'), 1);
      responseCommand = responseKeys[0];
      //debugger;
      switch (responseCommand) {
        case RESPONSE.FEATURES:
          removeEventListeners();
          elemOnoff.innerHTML = '';
          elemFeatures.innerHTML = '';
          response.features.forEach(function (feature) {
            +feature.type == 1 && elemFeatures.appendChild(
              parseResponse(feature)
            );
            +feature.type == 2 && elemOnoff.appendChild(
              parseResponse(feature)
            );
          });
          showAllFieldsets(true);
          break;
        case RESPONSE.INFO:
          removeEventListeners();
          elemInfo.innerHTML = '';
          response.deviceInfo.forEach(function (feature) {
            elemInfo.appendChild(
              parseResponse(feature)
            );
          });
          break;
        case RESPONSE.PREVIEW:
          removeEventListeners();
          elemPreview.innerHTML = '';
          var
            previewUrl = document.createElement('a'),
            notice = document.createElement('span')
          ;
          previewUrl.title = response.url;
          previewUrl.textContent = response.url;
          previewUrl.href = response.url;
          elemPreview.appendChild(previewUrl);
          notice.textContent = ' (' + UI.STREAMING_NOTICE + ')';
          elemPreview.appendChild(notice);
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
    disableAllInputs(false);
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
        elemOnoff.innerHTML = '';
        elemFeatures.innerHTML = '';
        response.features.forEach(function (feature) {
          +feature.type == 1 && elemFeatures.appendChild(
            parseResponse(feature)
          );
          +feature.type == 2 && elemOnoff.appendChild(
            parseResponse(feature)
          );
        });
        showAllFieldsets(true);
        break;
    };
  }
};
function onInputClick (e) {
  var
    value, controlCommand,
    feature = this.name
  ;
  //debugger;
  if (this.type == 'button') {
    if (
      ~[
        COMMAND.RECORD_START.command,
        COMMAND.RECORD_STOP.command,
        COMMAND.PICTURE.command
      ].indexOf(feature)
    ) {
      //debugger;
      controlCommand = {command: feature};
      feature == COMMAND.PICTURE.command && (
        controlCommand[KEY.STATUS_TIMER] = Array.prototype.filter.call(
          document.querySelectorAll('input[name=' + KEY.STATUS_TIMER + ']'),
          function (radio) {
            return radio.checked;
          })[0].value
      );
      console.log('Controlling the device\t' + JSON.stringify(controlCommand));
      requestSet(controlCommand);
      disableAllInputs(true);
    } else if (feature == 'export-status') exportStatusHistory();
  } else {
    if (this.type == 'checkbox') {
      value = +this.checked+'';
    };
    if (this.type == 'radio') {
      value = this.value;
    };
    COMMAND.UPDATE.feature = feature;
    COMMAND.UPDATE.value = value;
    console.log('Updating the feature\t' + JSON.stringify(COMMAND.UPDATE));
    requestSet(COMMAND.UPDATE);
    disableAllInputs(true);
  };
};
function secondsToTimeString (seconds) {
  var minutes, hours;
  hours = Math.floor(seconds/3600);
  minutes = Math.floor(seconds/60) - hours * 60;
  seconds = seconds - hours * 3600 - minutes * 60;
  return ''.concat(hours + 'h ', minutes + 'min ', seconds + 'sec');
};
function kilobytesToSpaceString (kib) {
  var mib, gib;
  gib = Math.floor(kib/(1024*1024));
  mib = Math.floor(kib/1024) - gib * 1024;
  kib = kib - gib * 1024 * 1024 - mib * 1024;
  return ''.concat(gib + 'GiB ', mib + 'MiB ', kib + 'KiB');
};
function parseResponse (response) {
  var
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
        radio.addEventListener('click', onInputClick, false);
        radio.addEventListener('tap', onInputClick, false);
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
      checkbox.addEventListener('click', onInputClick, false);
      checkbox.addEventListener('tap', onInputClick, false);
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
            dd.textContent = kilobytesToSpaceString(+response[key]);
            break;
          case KEY.STATUS_SPACE_TOTAL:
            dd.textContent = kilobytesToSpaceString(+response[key]);
            break;
          case KEY.STATUS_TIME_RECORDING:
            dd.textContent = secondsToTimeString(+response[key]);
            break;
          case KEY.STATUS_TIME_REMAINING:
            dd.textContent = secondsToTimeString(+response[key]);
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
function requestSet (command) {
  var xhrFeatures = new XMLHttpRequest();
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
(function init () {
  watchStatus();
  WATCH_STATUS_INTERVALID = setInterval(watchStatus, WATCH_STATUS_PERIOD);
})();
