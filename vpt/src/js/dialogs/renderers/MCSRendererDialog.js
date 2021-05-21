// #package js/main

// #include ../AbstractDialog.js
// #include ../../TransferFunctionWidget.js

// #include ../../../uispecs/renderers/MCSRendererDialog.json

class MCSRendererDialog extends AbstractDialog {

constructor(renderer, options) {
    super(UISPECS.MCSRendererDialog, options);

    this._renderer = renderer;

    this._handleChange = this._handleChange.bind(this);
    this._handleTFChange = this._handleTFChange.bind(this);
    this._handleIterateGallery = this._handleIterateGallery.bind(this);

    this._binds.extinction.addEventListener('input', this._handleChange);

    this._binds.iterateGalleryBtn.addEventListener('click', this._handleIterateGallery);

    this._tfwidget = new TransferFunctionWidget();
    this._binds.tfcontainer.add(this._tfwidget);
    this._tfwidget.addEventListener('change', this._handleTFChange);
    
    this._gallery = options._gallery;
}

destroy() {
    this._tfwidget.destroy();
    super.destroy();
}

_handleIterateGallery(){
    if (this._gallery){
        this._gallery.nextIteration();
    }
}

_handleChange() {
    const _sigmaMax = this._binds.extinction.getValue();
    const _alphaCorrection = this._binds.extinction.getValue();

    this._renderer._sigmaMax = _sigmaMax;
    this._renderer._alphaCorrection = _alphaCorrection;

    this._gallery.handle_MCSRendererDialogChange(_sigmaMax, _alphaCorrection);

    this._renderer.reset();
}

_handleTFChange() {
    this._renderer.setTransferFunction(this._tfwidget.getTransferFunction());
    this._renderer.reset();
}

}
