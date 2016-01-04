
Player = function(id, startX, startY, time, isMe) {
    console.log("player %i created at %i:%i. is me? %s", id, startX, startY, isMe);

    this._id = id;
    this._freshHistory = [];
    this._oldHistory = [];
    this._freshHistory.push({'x': startX, 'y': startY, 'time': time});
    this._isMe = isMe;
}

Player.prototype.constructor = Player;

Player.prototype = {
    updateBackendPos: function(x, x, time) {
        this._freshHistory.push({'x': x, 'y': x, 'time': time});
    }
};

Object.defineProperty(Player.prototype, "id", {
    get: function() {
        return this._id;
    }
});

Object.defineProperty(Player.prototype, "lastPos", {
    get: function() {
        return this._freshHistory[this._freshHistory.length-1];
    }
});

Object.defineProperty(Player.prototype, "isMe", {
    get: function() {
        return this._isMe;
    }
});