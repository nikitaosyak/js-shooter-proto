function Interpolator() {
    console.log('interpolator created');
    this._nodeKeyList = [];
    this._tt = -1;
}

Interpolator.prototype.constructor = Interpolator;

Interpolator.prototype = {
    addNode: function(id, startState) {
        this[id] = new InterpolatorNode(id, startState);
        this._nodeKeyList.push(id);
        console.log(this);
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
        if (this._tt == -1) {
            this._tt = calculatedServerTime;
        } else {
            // console.log(calculatedServerTime - this._tt, dt);
            this._tt = calculatedServerTime;
        }

        // console.log(dt, calculatedServerTime);
        // console.log(this._nodeKeyList);
        for (var i = 0; i < this._nodeKeyList.length; i++) {
            var n = this[this._nodeKeyList[i]];
            n.update(dt, calculatedServerTime);
        }
    },
};

Object.defineProperty(Interpolator.prototype, "testLerpTime", {
    get: function() {
        var srvDelta = Facade.connection.sync.srvDelta;
        var lag = Facade.connection.sync.lag;
        var calculatedServerTime = Date.now() - srvDelta - lag;

        var result = [];
        for (var i = 0; i < this._nodeKeyList.length; i++) {
            var node = this[this._nodeKeyList[i]];
            if (node._id == Facade.myId) continue;
            for (var j = 0; j < node._propertyNamelist.length; j++) {
                var p = node[node._propertyNamelist[j]];
                result.push(calculatedServerTime - p.simulatedTime);
                //p.update(dt, calculatedServerTime);
            }
            //n.update(dt, calculatedServerTime);
        }
        return result;
    }
});