// #package js/main

// #include utils
// #include readers
// #include loaders
// #include dialogs
// #include dialogs/renderers
// #include dialogs/tonemappers
// #include ui
// #include RenderingContext.js

class Gallery {

constructor() {
    this._handleMouseDown = this._handleMouseDown.bind(this);
    
    this._n = 6;
    this._gallery_container = new GalleryContainer();
    this._gallery_items = []
    this._selected_item = -1;

    

    this._populateGallery(this._n);
    this._setMouseDownListeners();

    this._dialog = null;
    this._toneDialog = null;
    this._mainHistogram = new Array(255).fill(0);
}

_setMouseDownListeners(){
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i].getCanvas().addEventListener('mousedown', this._handleMouseDown);
    }
}

_handleMouseDown(e){
    var item_pressed = e.target.id.split("_")[2];
    this._selected_item = parseInt(item_pressed);
    this._outlineTheSelectedItem();

    this._dialog._tfwidget._bumps = this._gallery_items[this._selected_item]._item_bumps;

    this._dialog._tfwidget.render();
    this._dialog._tfwidget._rebuildHandles();
    this._dialog._tfwidget.trigger('change');     

}

_outlineTheSelectedItem(){
    for (let i = 0; i < this._n; i++){
        if (i == this._selected_item){
            this._gallery_items[i].getCanvas().style = "outline: 3px dashed gray"
        } else {
            this._gallery_items[i].getCanvas().style = "outline: none"
        }
    }
}

_populateGallery(){
    for (var i = 0; i < this._n; i++){
        var item = new GalleryItem(i);
        this._gallery_container._element.appendChild(item.getCanvas());
        this._gallery_items.push(item);
    }
}

resetGalleryItems(){
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i]._item_rendering_context._renderer.reset();
        this._gallery_items[i]._item_rendering_context._n_of_iterations = 0;
        this._gallery_items[i]._item_rendering_context.stopRendering();
        this._gallery_items[i]._item_rendering_context.startRendering();
    }
}

nextIteration(){
    if (this._selected_item == -1){
        return;
    } 
    var bumps = this._iterator.iterate(this._gallery_items[this._selected_item]._item_bumps);
    this._selected_item = -1;
    this._outlineTheSelectedItem();


    for (let i = 0; i < this._n; i++){
        this._gallery_items[i]._item_bumps = bumps[i];
    }
    
    this.drawGalleryItems(bumps);
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i]._item_rendering_context._renderer.reset();
        this._gallery_items[i]._item_rendering_context._n_of_iterations = 0;
        this._gallery_items[i]._item_rendering_context.stopRendering();
        this._gallery_items[i]._item_rendering_context.startRendering();
    }

}

insertionSort(inputArr) {
    let n = inputArr.length;
        for (let i = 1; i < n; i++) {
            let current = inputArr[i];
            let j = i-1; 
            while ((j > -1) && (current > inputArr[j])) {
                inputArr[j+1] = inputArr[j];
                j--;
            }
            inputArr[j+1] = current;
        }
    return inputArr;
}

getHistogramPeaks(n_of_peaks){
    var peaks_vals = [];
    
    const sum = this._mainHistogram.reduce((a, b) => a + b, 0);
    const avg = (sum / this._mainHistogram.length) || 0;
    var threshold = avg;

    for (var i = 1; i < this._mainHistogram.length - 1; ++i) {
        if (this._mainHistogram[i-1] < this._mainHistogram[i] && this._mainHistogram[i] > this._mainHistogram[i+1] && this._mainHistogram[i] >= threshold){
            peaks_vals.push(this._mainHistogram[i]);
        }
    } 

    var peaks_vals_sorted = this.insertionSort(peaks_vals);

    var topValues = [this._mainHistogram.indexOf(peaks_vals_sorted[0])];
    var curr = 0;
    for (let i = 1; i < peaks_vals_sorted.length; i++){
        if (topValues.length == n_of_peaks) break;
        if (Math.abs(this._mainHistogram.indexOf(peaks_vals_sorted[i]) - topValues[curr]) > 10){
            topValues.push(this._mainHistogram.indexOf(peaks_vals_sorted[i]) )
            curr += 1;
        }
    }

    for (let i = 0; i < topValues.length; i++){
        topValues[i] /= 255;
    }

    return topValues;
}

setInitialTransferFunctions(){
    this._topValues = this.getHistogramPeaks(6);

    this._iterator = new Iterator(this._topValues, this._n);
    var allBumps = this._iterator.getBumps();

    for (let i = 0; i < this._n; i++){
        this._gallery_items[i]._item_bumps = allBumps[i];
    }

    this._gl = this.drawGalleryItems(allBumps);
    
}


drawGalleryItems(allBumps){
    if (this._gl) this._gl = null;
    var canvas = document.createElement('canvas');
    
        canvas.width = 256;
        canvas.height = 256;
    
        const gl = canvas.getContext('webgl2', {
            depth                 : false,
            stencil               : false,
            antialias             : false,
            preserveDrawingBuffer : true
    });

    for (let i = 0; i < this._n; i++){
        var bumps = allBumps[i];
        
    
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
        var clipQuad = WebGL.createClipQuad(gl);
        var program = WebGL.buildPrograms(gl, {
            drawTransferFunction: SHADERS.drawTransferFunction
        }, MIXINS).drawTransferFunction;
    
        gl.useProgram(program.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, clipQuad);
        gl.enableVertexAttribArray(program.attributes.aPosition);
        gl.vertexAttribPointer(program.attributes.aPosition, 2, gl.FLOAT, false, 0, 0);
    
        bumps.forEach(bump => {
            gl.uniform2f(program.uniforms['uPosition'], bump.position.x, bump.position.y);
            gl.uniform2f(program.uniforms['uSize'], bump.size.x, bump.size.y);
            gl.uniform4f(program.uniforms['uColor'], bump.color.r, bump.color.g, bump.color.b, bump.color.a);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        });

        var transferFunction = WebGL.createTexture(this._gallery_items[i]._item_rendering_context._gl, {
            width  : 2,
            height : 1,
            data   : new Uint8Array([255, 0, 0, 0, 255, 0, 0, 255]),
            wrapS  : gl.CLAMP_TO_EDGE,
            wrapT  : gl.CLAMP_TO_EDGE,
            min    : gl.LINEAR,
            mag    : gl.LINEAR
        });

        this._gallery_items[i]._item_rendering_context._gl.bindTexture(this._gallery_items[i]._item_rendering_context._gl.TEXTURE_2D, transferFunction);
        this._gallery_items[i]._item_rendering_context._gl.texImage2D(this._gallery_items[i]._item_rendering_context._gl.TEXTURE_2D, 0,
            this._gallery_items[i]._item_rendering_context._gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        this._gallery_items[i]._item_rendering_context._gl.bindTexture(this._gallery_items[i]._item_rendering_context._gl.TEXTURE_2D, null);
        
        this._gallery_items[i]._item_rendering_context._renderer._transferFunction = transferFunction; 

    }

    return gl;
}




getGalleryContainer(){
    return this._gallery_container;
}

// Camera controls
rotateAroundSelf(angleX, angleY){
    for (var i = 0; i < this._n; i++){
        this._gallery_items[i].rotateAroundSelf(angleX, angleY);
    }
}

rotateAroundFocus(angleX, angleY){
    for (var i = 0; i < this._n; i++){
        this._gallery_items[i].rotateAroundFocus(angleX, angleY);
    }
}

zoom(amount, keepScale){
    for (var i = 0; i < this._n; i++){
        this._gallery_items[i].zoom(amount, keepScale);
    }
}

handle_MCMRendererDialogChange(absorptionCoefficient, scatteringCoefficient, scatteringBias, majorant, maxBounces, steps){
    for (var i = 0; i < this._n; i++){
        var renderer = this._gallery_items[i]._item_rendering_context._renderer;
        renderer.absorptionCoefficient = absorptionCoefficient;
        renderer.scatteringCoefficient = scatteringCoefficient;
        renderer.scatteringBias = scatteringBias;
        renderer.majorant = majorant;
        renderer.maxBounces = maxBounces;
        renderer.steps = steps;
        renderer.reset();

        this._gallery_items[i]._item_rendering_context._n_of_iterations = 0;
        this._gallery_items[i]._item_rendering_context.startRendering(); 
    }
}

handle_EAMRendererDialogChange(stepsize, alphaCorrection){
    for (var i = 0; i < this._n; i++){
        var renderer = this._gallery_items[i]._item_rendering_context._renderer;
        renderer._stepsize = stepsize;
        renderer._alphaCorrection = alphaCorrection;
        renderer.reset();

        this._gallery_items[i]._item_rendering_context._n_of_iterations = 0;
        this._gallery_items[i]._item_rendering_context.startRendering(); 
    }
}

handle_MCSRendererDialogChange(_sigmaMax, _alphaCorrection){
    for (var i = 0; i < this._n; i++){
        var renderer = this._gallery_items[i]._item_rendering_context._renderer;
        renderer._sigmaMax = _sigmaMax;
        renderer._alphaCorrection = _alphaCorrection;
        renderer.reset();

        this._gallery_items[i]._item_rendering_context._n_of_iterations = 0;
        this._gallery_items[i]._item_rendering_context.startRendering(); 
    }
}



hide(){
    this._gallery_container.hide();
    
}

show(){
    this._gallery_container.show();
}

getGalleryCameras(){
    var cameras = []
    for (let i = 0; i < this._n; i++){
        cameras.push(this._gallery_items[i].getCamera());
    }
    return cameras;
}

getGalleryRenderingContexts(){
    var contexts = []
    for (let i = 0; i < this._n; i++){
        contexts.push(this._gallery_items[i].getRenderingContext());
    }
    return contexts;
}

setTransformation(sx, sy, sz, tx, ty, tz){
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i].setScale(sx, sy, sz);
        this._gallery_items[i].setTranslation(tx, ty, tz);
    }
}

setFilter(filter){
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i].setFilter(filter);
    }
}

chooseRenderer(which){
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i].chooseRenderer(which);
    }
}

chooseToneMapper(which){
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i].chooseToneMapper(which);
    }
}

stopRendering(){
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i].stopRendering();
    }
}

setVolume(volume){
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i].setVolume(volume);
    }
    //this.setInitialTransferFunctions();
}

setEnvironmentMapAndReset(image){
    for (let i = 0; i < this._n; i++){
        this._gallery_items[i].setEnvironmentMap(image);
        this._gallery_items[i].resetRenderer();
    }
}
}
