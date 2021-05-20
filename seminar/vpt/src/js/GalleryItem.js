// #package js/main

// #include utils
// #include readers
// #include loaders
// #include dialogs
// #include dialogs/renderers
// #include dialogs/tonemappers
// #include ui
// #include RenderingContext.js

class GalleryItem {

constructor(i) {
    this._item_rendering_context = new RenderingContext();
    this._item_canvas = this._item_rendering_context.getCanvas();
    this._item_canvas.className += 'renderer_gallery_item';
    this._item_canvas.id += "gallery_item_" + i;

    this._setResolution(128);
    this._item_bumps = [];
}


_setResolution(resolution){
    this._item_rendering_context.setResolution(resolution);
}

// Camera controls
rotateAroundSelf(angleX, angleY){
    this._item_rendering_context._n_of_iterations = 0;
    this._item_rendering_context.startRendering();
    this._item_rendering_context._cameraController._rotateAroundSelf(angleX, angleY);
}

rotateAroundFocus(angleX, angleY){
    this._item_rendering_context._n_of_iterations = 0;
    this._item_rendering_context.startRendering();
    this._item_rendering_context._cameraController._rotateAroundFocus(angleX, angleY);
}

zoom(amount, keepScale){
    this._item_rendering_context._n_of_iterations = 0;
    this._item_rendering_context.startRendering();
    this._item_rendering_context._cameraController._zoom(amount, keepScale);
}


getCanvas(){
    return this._item_canvas;
}

getRenderingContext(){
    return this._item_rendering_context;
}

getCamera(){
    return this._item_rendering_context.getCamera();
}

setScale(sx, sy, sz){
    this._item_rendering_context.setScale(sx, sy, sz);
}

setTranslation(tx, ty, tz){
    this._item_rendering_context.setTranslation(tx, ty, tz);
}

setFilter(filter){
    this._item_rendering_context.setFilter(filter);

}

chooseRenderer(which){
    this._item_rendering_context.chooseRenderer(which);
}

chooseToneMapper(which){
    this._item_rendering_context.chooseToneMapper(which);
}

stopRendering(){
    this._item_rendering_context.stopRendering();
}

setVolume(volume){
    this._item_rendering_context.setVolume(volume);
}

setEnvironmentMap(image){
    this._item_rendering_context.setEnvironmentMap(image);
}

resetRenderer(){
    this._item_rendering_context.getRenderer().reset();
}
}