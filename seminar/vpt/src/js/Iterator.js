// #package js/main

// #include utils
// #include readers
// #include loaders
// #include dialogs
// #include dialogs/renderers
// #include dialogs/tonemappers
// #include ui
// #include RenderingContext.js

class Iterator {

constructor(histogramPeaks, n_of_galleries) {
    this._iteration = 0;
    this._n_of_galleries = n_of_galleries;

    this._histogramPeaks = histogramPeaks;
    this._bumps = [];

    this._invisibles = [];
    this._doneColors = [];

    this._colors = [{"r": 1, "g": 0, "b": 0, "a": 1}, 
                  {"r": 0, "g": 1, "b": 0, "a": 1}, 
                  {"r": 0, "g": 0, "b": 1, "a": 1}, 
                  {"r": 1, "g": 0, "b": 1, "a": 1},
                  {"r": 0, "g": 1, "b": 1, "a": 1},
                  {"r": 1, "g": 1, "b": 0, "a": 1}];

    this._setInitialBumps();
}

getBumps(){
    return this._bumps;
}

iterate(selected){
    this._invisibles = [];
    // Ignore colors with opacity lower than 0.3
    for (let i = 0; i < selected.length; i++){
        if (selected[i].color.a <= 0.3){
            this._invisibles.push(i);
        }
    }

    var currentColor = -1;

    for (let i = 0; i < selected.length; i++){
        if (this._invisibles.includes(i) || this._doneColors.includes(i)){
            continue;
        }

        currentColor = i;
        break;
    }

    this._setIterationBumps(currentColor, selected);

    this._doneColors.push(currentColor);

    return this._bumps;
}


_setIterationBumps(whichColor, bumps){
    this._bumps = [];
    for (let i=0; i < this._n_of_galleries; i++){
        let currBumps = JSON.parse(JSON.stringify(bumps));
        currBumps[whichColor].position.y = ((0.95 - 0.05) / this._n_of_galleries) * (i + 1);
        currBumps[whichColor].size.y = 0.27;
        this._bumps.push(currBumps);
    }
}

_setInitialBumps(){

    for (let i = 0; i < this._n_of_galleries; i++){
        var colors = [{"r": 1, "g": 0, "b": 0, "a": 1}, 
                  {"r": 0, "g": 1, "b": 0, "a": 1}, 
                  {"r": 0, "g": 0, "b": 1, "a": 1}, 
                  {"r": 1, "g": 0, "b": 1, "a": 1},
                  {"r": 0, "g": 1, "b": 1, "a": 1},
                  {"r": 1, "g": 1, "b": 0, "a": 1}];
        var bumps_for_gallery = []
        for (let j = 0; j < this._histogramPeaks.length; j++){
            var bump = {
                "color": colors[j],
                "position": {"x": this._histogramPeaks[j], "y": 0.5},
                "size": {"x": 0.05, "y": 4}
            }
            if (i == j) bump.color.a = 0.3;
            
            bumps_for_gallery.push(bump);
        }
        this._bumps.push(bumps_for_gallery);
    }
}

}
