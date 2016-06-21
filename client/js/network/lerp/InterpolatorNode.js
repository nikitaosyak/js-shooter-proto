InterpolatorNode = function(playerId, startState) {
    this._id = playerId;
    this._interpolatedTime = 0;
    this._propertyNamelist = [];

    for (var propertyName in startState) {
        this[propertyName] = new InterpolatorNodeProperty(propertyName, startState[propertyName]);
        this._propertyNamelist.push(propertyName);
    }
    // console.log('creating lerp node for player %s with properies %s', playerId, this._propertyNamelist.join(', '));
};

InterpolatorNode.prototype.constructor = InterpolatorNode;

InterpolatorNode.prototype = {
    addPropertyValue: function(name, value) {
        if (!(name in this)) {
            console.error('no [', name, '] property found on player', this._id, ' interpolatorNode');
            return;
        }
        this[name].addState(value);
    },

    purge: function() {
        this._id = -1;
        this._interpolatedTime = 0;
        for (var i = 0; i < this._propertyNamelist.length; i++) {
            var pk = this._propertyNamelist[i];
            this[pk].purge();
        }
        this._propertyNamelist = null;
    },

    update: function(dt, calculatedServerTime) {
        for (var i = 0; i < this._propertyNamelist.length; i++) {
            var p = this[this._propertyNamelist[i]];
            p.update(dt, calculatedServerTime);
        }
    },
};