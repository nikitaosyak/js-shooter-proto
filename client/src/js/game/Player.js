
Player = function(id, startX, startY, isMe) {
    console.log("player %i created at %i:%i. is me? %s", id, startX, startY, isMe);

    this._id = id;
    this._freshHistory = [];
    this._oldHistory = [];
    this._oldHistory.push({'x': startX, 'y': startY, 'time': 0});
    this._isMe = isMe;

    this._drained = true;
    this._interpolatedTime = -1;
    this._maximumBufferTime = Facade.params.serverUpdateTime * 2.5;
}

Player.prototype.constructor = Player;

Player.prototype = {
    updateBackendPos: function(x, y, time) {
        this._freshHistory.push({'x': x, 'y': y, 'time': time});
    },

    interpolate: function(state) {
        if (this._drained) {
            if (this._freshHistory.length >= 2) {
                this._drained = false;
            } else {
                return;
            }
        }

        var len = this._freshHistory.length;
        var currentServerTime = Date.now() - Facade.srvDeltaTime - Facade.approxLag;
        var approxBufferTime = currentServerTime - this._freshHistory[0].time;
        console.log(approxBufferTime, 'srv time', currentServerTime, 'lastHistoryEntryTime', this._freshHistory[len-1].time);
    },
};

Object.defineProperty(Player.prototype, "id", {
    get: function() {
        return this._id;
    }
});

Object.defineProperty(Player.prototype, "lastPos", {
    get: function() {
        var freshLen = this._freshHistory.length;
        if (freshLen > 0) {
            return this._freshHistory[freshLen-1];
        }
        return this._oldHistory[this._oldHistory.length-1];
    }
});

Object.defineProperty(Player.prototype, "isMe", {
    get: function() {
        return this._isMe;
    }
});