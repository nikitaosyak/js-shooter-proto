Interpolator = function() {
    console.log('interpolator created');
    this._nodes = {};
    this._lerpTime = 0;
};

Interpolator.prototype.constructor = Interpolator;

Interpolator.prototype = {
    addNode: function(id, startState) {
        this._nodes[id] = new InterpolatorNode(id, startState);
    },

    removeNode: function(id) {
        this._nodes[id].purge();
        delete this._nodes[id];
    },

    addPropertyValue: function(id, name, state) {
        this._nodes[id].addPropertyValue(name, state);
    },

    update: function(dt) {
        var srvDelta = Facade.connection.sync.srvDelta;
        var lag = Facade.connection.sync.lag;
        var calculatedServerTime = Date.now() - srvDelta - lag;

        var id, n;
        for (id in this._nodes) {
            n = this._nodes[id];
            n.update(dt, calculatedServerTime);
        }

        var minimalSimulatedTime = Number.POSITIVE_INFINITY;
        for (id in this._nodes) {
            n = this._nodes[id];
            if (n.simulatedTime < minimalSimulatedTime) {
                minimalSimulatedTime = n.simulatedTime;
            }
        }

        if (minimalSimulatedTime == Number.POSITIVE_INFINITY || minimalSimulatedTime === 0) {
            this._lerpTime = 0;
        } else {
            this._lerpTime = calculatedServerTime - minimalSimulatedTime;
        }
    },


    //
    // for visual state

    getRawProperty: function(id, propertyName) { return this._nodes[id].getRawPropertyValue(propertyName); },
    getLerpProperty: function(id, propertyName) { return this._nodes[id].getLerpPropertyValue(propertyName); },
};

Object.defineProperty(Interpolator.prototype, "lerpTime", {
    get: function() {
        return this._lerpTime;
    }
});