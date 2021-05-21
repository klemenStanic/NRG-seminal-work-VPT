// #package js/main

// #include ../utils
// #include UIObject.js

class GalleryContainer extends UIObject {

constructor(options) {
    super(TEMPLATES.GalleryContainer, options);
    //this._$html = DOMUtils.instantiate(TEMPLATES.RenderSpace);
}

_log(text, level) {
    const newLog = DOMUtils.instantiate(TEMPLATES.StatusBarLog);
    const binds = DOMUtils.bind(newLog);
    binds.timestamp.textContent = new Date().toISOString();
    binds.content.textContent = text;
    if (level) {
        newLog.classList.add(level);
    }
    this._element.appendChild(newLog);
    this._element.scrollTop = this._element.scrollHeight;
}

log(text) {
    this._log(text);
}

info(text) {
    this._log(text, 'info');
}

warning(text) {
    this._log(text, 'warning');
}

error(text) {
    this._log(text, 'error');
}

}
