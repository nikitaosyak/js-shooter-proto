InterpolatorNode = function(playerId, startState) {
    console.log('creating lerp node for player', playerId);
    this._id = playerId;
    this._interpolatedTime = 0;
    this._properties = {};

    for (var propertyName in startState) {
        this._properties[propertyName] = new InterpolatorNodeProperty(propertyName, startState[propertyName]);
    }
};

InterpolatorNode.prototype.constructor = InterpolatorNode;

InterpolatorNode.prototype = {
    addPropertyValue: function(name, value) {
        if (!(name in this._properties)) {
            console.error('no [', name, '] property found on player', this._id, ' interpolatorNode');
            return;
        }
        this._properties[name].addState(value);
    },

    purge: function() {
        this._id = -1;
        this._interpolatedTime = 0;
        for (var pk in this._properties) {
            this._properties[pk].purge();
        }
        this._properties = null;
    },

    update: function(dt, serverTime) {
        var minimumSimulatedTime = Number.POSITIVE_INFINITY; // todo: this must be not nessessary
        for (var pk in this._properties) {
            var p = this._properties[pk];
            p.update(dt, serverTime);
            if (p.simulatedTime < minimumSimulatedTime) {
                minimumSimulatedTime = p.simulatedTime;
            }
        }
        this._simulatedTime = minimumSimulatedTime;
    },

    getRawPropertyValue: function(name) { return this._properties[name].rawValue; },
    getLerpPropertyValue: function(name) { return this._properties[name].lerpValue; },
};

Object.defineProperty(InterpolatorNode.prototype, "simulatedTime", {
    get: function() {
        return this._simulatedTime;
    }
});