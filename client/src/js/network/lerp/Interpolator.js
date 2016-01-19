Interpolator = function() {
    console.log('interpolator created');
    this._nodeKeyList = [];
};

Interpolator.prototype.constructor = Interpolator;

Interpolator.prototype = {
    addNode: function(id, startState) {
        this[id] = new InterpolatorNode(id, startState);
        this._nodeKeyList.push(id);
    },

    removeNode: function(id) {
        this[id].purge();
        this._nodeKeyList.splice(this._nodeKeyList.indexOf(id), 1);
        delete this[id];
    },

    update: function(dt) {
        var srvDelta = Facade.connection.sync.srvDelta;
        var lag = Facade.connection.sync.lag;
        var calculatedServerTime = Date.now() - srvDelta - lag;

        // console.log(dt, calculatedServerTime);
        for (var i = 0; i < this._nodeKeyList.length; i++) {
            var n = this[this._nodeKeyList[i]];
            n.update(dt, calculatedServerTime);
        }
    },
};