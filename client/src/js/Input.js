
var _KEY_TO_VEL = {
    87: {'x': 0, 'y': -1},
    83: {'x': 0, 'y': 1},
    65: {'x': -1, 'y': 0},
    68: {'x': 1, 'y': -0}
};

var _OPPOSITE_KEYS = {
    87: 83,
    83: 87,
    65: 68,
    68: 65
};

Input = function(game, onVelocityChange, velocityContext) {
    console.log("input created");
    game.input.keyboard.addCallbacks(this, this._onKeyDown, this._onKeyUp, null);

    this._onVelocityChange = onVelocityChange;
    this._velocityContext = velocityContext;
    this.reset();
}
Input.prototype.constructor = Input;

Input.prototype = {

    reset: function() {
        console.log("input reset");
        this._velocity = new Phaser.Point(0, 0);
        this._lastX = 0;
        this._lastY = 0;
        this._lastVelStarted = 0;
        this._lastVelEnded = 0;
        this._myVelocityUpdated = 0;
        this._shitSum = 0;
        this._downHistory = [];
        this._downKeys = {};
        for (var k in _KEY_TO_VEL) {
            this._downKeys[k] = false;
        }
    },
    
    update: function(dt) {
        if (this._velocity.isZero()) {
            if (this._lastVelEnded > 0) {
                var myLastDt = this._lastVelEnded - this._myVelocityUpdated;
                this._shitSum += myLastDt;
                console.log('lastShitsum: ', this._shitSum);
                this._shitSum = 0;
                this._lastVelEnded = 0;
                this._myVelocityUpdated = 0;
            }
            return;
        }

        var now = Date.now();
        var myDt = now - this._myVelocityUpdated;
        // console.log('updating for current velocity: dt: ', dt, '; myDt: ', myDt);
        this._myVelocityUpdated = now;
        this._shitSum += myDt;
    },

    _onKeyDown: function(e) {
        if (!(e.keyCode in _KEY_TO_VEL)) return;
        if (this._downKeys[e.keyCode]) return;
        this._downKeys[e.keyCode] = true;

        var kVel = _KEY_TO_VEL[e.keyCode];
        var multiplier = this._downKeys[_OPPOSITE_KEYS[e.keyCode]] ? 2 : 1;
        this._downHistory.push(e.keyCode);
        this._velocity.add(kVel.x * multiplier, kVel.y * multiplier);
        this._invalidateVelocity();

        // console.log('current velocity: %s, %s', this._velocity.x, this._velocity.y);
    },

    _onKeyUp: function(e) {
        if (!(e.keyCode in _KEY_TO_VEL)) return;
        if (!this._downKeys[e.keyCode]) return;
        this._downKeys[e.keyCode] = false;

        var kVel = _KEY_TO_VEL[e.keyCode];
        var oppKey = _OPPOSITE_KEYS[e.keyCode];
        var multiplier = 1;

        var thisKeyOrder = this._downHistory.indexOf(e.keyCode);
        if (this._downKeys[oppKey]) {
            var oppKeyOrder = this._downHistory.indexOf(oppKey);
            if (thisKeyOrder > oppKeyOrder) {
                multiplier = 2;
            } else {
                multiplier = 0;
            }
        }
        this._downHistory.splice(thisKeyOrder, 1);
        this._velocity.subtract(kVel.x * multiplier, kVel.y * multiplier);
        this._invalidateVelocity();

        // console.log('current velocity: %s, %s', this._velocity.x, this._velocity.y);  
    },

    _invalidateVelocity: function() {
        var sameX = this._velocity.x == this._lastX;
        var sameY = this._velocity.y == this._lastY;
        if (!sameX || !sameY) {
            var ts = 0;
            var now = Date.now();
            if (this._lastVelStarted != 0) {
                ts = now - this._lastVelStarted;
            }
            this._onVelocityChange.call(this._velocityContext, this._velocity, ts);
            this._lastX = this._velocity.x;
            this._lastY = this._velocity.y;

            if (this._velocity.isZero()) {
                this._lastVelStarted = 0;
                this._lastVelEnded = now;
            } else {
                this._lastVelStarted = this._myVelocityUpdated = now;
            }
        }
    }
}

Object.defineProperty(Input.prototype, "velocity", {
    get: function() {
        return this._velocity;
    }
});