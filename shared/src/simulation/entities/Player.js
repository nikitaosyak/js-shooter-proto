
Player = function(id, x, y, name, isMe) {
    this._id = id;
    
    this.pos = {x: x, y: y};
    this.lastSentPointer = {x: -1, y: -1};
    this.pointer = {x: -1, y: -1};

    this.alive = true;

    this.name = name;
    this.isMe = isMe;
};
Player.prototype.constructor = Player;

Player.prototype = {
    destroy: function() {
        this._id = NaN;
        this.pos = null;
        this.lastSentPointer = null;
        this.pointer = null;
        this.alive = false;
    }
};

Object.defineProperty(Player.prototype, "id", {
    get: function() {
        return this._id;
    }
});

if (typeof module !== 'undefined') {
    module.exports.Player = Player;
}