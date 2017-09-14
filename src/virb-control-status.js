function VirbControlStatus (_window) {
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
};