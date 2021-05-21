// #package js/main

// #include ../AbstractDialog.js
// #include ../../TransferFunctionWidget.js

// #include ../../../uispecs/renderers/EAMRendererDialog.json

class EAMRendererDialog extends AbstractDialog {

constructor(renderer, options) {
    super(UISPECS.EAMRendererDialog, options);

    this._renderer = renderer;

    this._handleChange = this._handleChange.bind(this);
    this._handleTFChange = this._handleTFChange.bind(this);
    this._handleIterateGallery = this._handleIterateGallery.bind(this);

    this._binds.steps.addEventListener('input', this._handleChange);
    this._binds.opacity.addEventListener('input', this._handleChange);

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
    console.log("here b4");
    if (this._gallery){
        console.log("here");
        this._gallery.nextIteration();
    }
}

_handleChange() {
    const stepsize =  1 / this._binds.steps.getValue();
    const alphaCorrection =  this._binds.opacity.getValue();
    
    this._renderer._stepSize = stepsize;
    this._renderer._alphaCorrection = alphaCorrection;

    this._gallery.handle_EAMRendererDialogChange(stepsize, alphaCorrection);

    this._renderer.reset();
}

_handleTFChange() {
    this._renderer.setTransferFunction(this._tfwidget.getTransferFunction());
    this._renderer.reset();
}

}
