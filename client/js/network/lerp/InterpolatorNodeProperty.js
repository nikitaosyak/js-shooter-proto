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
    // console.log('    created [', name, '] with lerp template {', this._template.join(', '), '}');

    this._freshHistory = [];
    this._oldHistory = [initialState];
    this._drained = true;

    this._simulationStarted = -1;
    this._targetSimulationTime = -1;
};

InterpolatorNodeProperty.constructor = InterpolatorNodeProperty;

InterpolatorNodeProperty.prototype = {
    addState: function(newState) {
        // console.log('adding state', newState);
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
        this._simulationStarted = -1;
        this._targetSimulationTime = -1;
    },

    update: function(dt, calculatedServerTime) {
        //todo: this will interpolate values with history and what not

        var len = this._freshHistory.length;
        if (this._drained) {
            if (len >= Facade.params.interpolationSnapshotBuffer) {
                this._drained = false;
            } else {
                return;
            }
        }

        var prevState = this._oldHistory[this._oldHistory.length-1];
        var nextState = this._freshHistory[0];
        var frameOverlapTime = 0;

        if (nextState.simulatedTime > 0) { 
            // simulation in progress
            if (calculatedServerTime >= this._targetSimulationTime) {
                frameOverlapTime = calculatedServerTime - this._targetSimulationTime;
                // console.log('action ended with diff', frameOverlapTime);
                // action ended
                this._iteratePropertyKeys(function(propertyName) {
                    this._lerpState[propertyName] = nextState[propertyName];
                }, this);

                this._simulationStarted = -1;
                this._targetSimulationTime = -1;
                nextState.simulatedTime = calculatedServerTime;
                this._oldHistory.push(this._freshHistory.shift());
                if (this._oldHistory.length > Facade.params.interpolatorHistoryLen) {
                    this._oldHistory.shift();
                }

                if (this._freshHistory.length === 0) {
                    this._drained = true;
                    // console.log('drained');
                    return;
                }

                prevState = this._oldHistory[this._oldHistory.length-1];
                nextState = this._freshHistory[0];
            }
        }

        if (nextState.simulatedTime < 0) { 
            // was not simulated
            var posTimespan = nextState.time - prevState.time;
            if (posTimespan > Facade.params.serverUpdateTime*1.1) { 
                // recovering from full stop
                this._simulationStarted = calculatedServerTime - dt;
                this._targetSimulationTime = calculatedServerTime + Facade.params.serverUpdateTime - dt;
                // console.log('WARPING for', posTimespan, 'for', this._targetSimulationTime - this._simulationStarted);
            } else { 
                // velocity vector changed
                // console.log('velocity change', posTimespan);
                this._simulationStarted = calculatedServerTime;
                this._targetSimulationTime = calculatedServerTime + posTimespan;
            }

            this._additionalForNextStep = 0;
        }
        this._simulationStarted -= frameOverlapTime;
        this._targetSimulationTime -= frameOverlapTime;

        nextState.simulatedTime = calculatedServerTime;
        var elapsedSimulationTime = nextState.simulatedTime - this._simulationStarted;
        var totalSimulationTime = this._targetSimulationTime - this._simulationStarted;
        
        var t = elapsedSimulationTime / totalSimulationTime;
        // console.log(elapsedSimulationTime);
        t = Math.min(t, 1); // clamp for no oversimulation

        this._iteratePropertyKeys(
            function(pn) {
                // console.log(pn, t, prevState[pn], nextState[pn], this._lerp(prevState[pn], nextState[pn], t));
                this._lerpState[pn] = this._lerp(prevState[pn], nextState[pn], t);
            },
        this);
    },

    _lerp: function(a, b, t) {
        return a + (b-a)*t;
    },

    _iteratePropertyKeys: function(iter, ctx) {
        for (var i = 0; i < this._template.length; i++) {
            var propertyName = this._template[i];
            iter.call(ctx, propertyName);
        }
    },
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