
State = function() {
    console.log("state created");
    this._id = -1;
    this._pos = new Phaser.Point(-1, -1);
}

State.prototype.constructor = State;

State.prototype = {
    injectId: function(value) {
        this._id = value;
    },

    injectPos: function(x, y) {
        this._pos.x = x;
        this._pos.y = y;
    }
};

Object.defineProperty(State.prototype, "id", {
    get: function() {
        return this._id;
    }
});

Object.defineProperty(State.prototype, "pos", {
    get: function() {
        return this._pos;
    }
});