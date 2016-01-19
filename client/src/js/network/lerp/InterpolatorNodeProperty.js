InterpolatorNodeProperty = function(name, initialState) {
    this._name = name;
    this._template = [];
    this._lerpState = {};
    
    initialState.time = -1;
    initialState.simulatedTime = -1;
    for (var interpolatedValueKey in initialState) {
        this._template.push(interpolatedValueKey);
        this._lerpState[interpolatedValueKey] = initialState[interpolatedValueKey];
    }
    console.log('    created [', name, '] with lerp template {', this._template.join(', '), '}');

    this._freshHistory = [];
    this._oldHistory = [initialState];
    this._drained = true;

    this._startSimulationTimeDiff = -1;
    this._targetSimulationTime = -1;
};

InterpolatorNodeProperty.constructor = InterpolatorNodeProperty;

InterpolatorNodeProperty.prototype = {
    addState: function(newState) {
        newState.simulatedTime = -1;
        this._freshHistory.push(newState);
    },

    purge: function() {
        this._name = 'purgedProperty_' + this._name;
        this._template = null;
        this._lerpState = null;
        this._freshHistory = null;
        this._oldHistory = null;
        this._drained = true;
        this._startSimulationTimeDiff = -1;
        this._targetSimulationTime = -1;
    },

    update: function(dt, serverTime) {
        //todo: this will interpolate values with history and what not
    }
};

Object.defineProperty(InterpolatorNodeProperty.prototype, 'rawValue', {
    get: function() {
        var freshLen = this._freshHistory.length;
        if (freshLen > 0) {
            return this._freshHistory[freshLen-1];
        }
        return this._oldHistory[this._oldHistory.length-1];
    }
});

Object.defineProperty(InterpolatorNodeProperty.prototype, 'lerpValue', {
    get: function() {
        return this._lerpState;
    }
});

Object.defineProperty(InterpolatorNodeProperty.prototype, 'simulatedTime', {
    get: function() {
        return this._lerpState.simulatedTime;
    }
});