function VirbControlStatus (_elemDocument) {
    if (!_elemDocument) {
        throw new Error(EXCEPTION.DOCUMENT_NOT_FOUND);
    } else {
        var
            self = this,
            elemDocument = _elemDocument
        ;
        self.elemDocument = elemDocument;
        self.elemStatus = elemDocument.querySelector('#'+ID.ELEM_DEVICE_STATUS);
        self.elemInfo = elemDocument.querySelector('#'+ID.ELEM_DEVICE_INFO);
        self.elemPreview = elemDocument.querySelector('#'+ID.ELEM_DEVICE_PREVIEW);
        self.elemFeatures = elemDocument.querySelector('#'+ID.ELEM_DEVICE_MULTIOPTION);
    };
}
VirbControlStatus.prototype.clear = function () {
    this.elemStatus.innerHTML = '';
    this.elemPreview.innerHTML = '';
    this.elemInfo.innerHTML = '';
    this.elemFeatures.innerHTML = '';
    this.elemStatus.textContent = UI.DETECTING;
};