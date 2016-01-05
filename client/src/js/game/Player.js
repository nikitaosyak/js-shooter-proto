
Player = function(id, startX, startY, isMe) {
    console.log("player %i created at %i:%i. is me? %s", id, startX, startY, isMe);

    this._id = id;
    this._freshHistory = [];
    this._oldHistory = [];
    this._oldHistory.push({'x': startX, 'y': startY, 'time': 0});
    this._isMe = isMe;
}

Player.prototype.constructor = Player;

Player.prototype = {
    updateBackendPos: function(x, y, time) {
        this._freshHistory.push({'x': x, 'y': y, 'time': time});
        console.log(this._freshHistory);
    }
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