InterpolatorNodeProperty = function(name, initialState) {
    this._name = name;
    this._template = [];
    for (var interpolatedValue in initialState) {
        this._template.push(interpolatedValue);
    }
    console.log('    created property', name, 'with lerp template', this._template);
    initialState.time = -1;
    initialState.simulatedTime = -1;

    this._freshHistory = [];
    this._oldHistory = [initialState];
    this._drained = true;

    this._startSimulationTimeDiff = -1;
    this._targetSimulationTime = -1;
};

InterpolatorNodeProperty.constructor = InterpolatorNodeProperty;

InterpolatorNodeProperty.prototype = {

};