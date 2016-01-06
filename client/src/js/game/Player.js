
Player = function(id, startX, startY, isMe) {
    console.log("player %i created at %i:%i. is me? %s", id, startX, startY, isMe);

    this._id = id;
    this._freshHistory = [];
    this._oldHistory = [];
    this._oldHistory.push({'x': startX, 'y': startY, 'time': 0,});
    this._isMe = isMe;

    this._drained = true;
    this._startSimulationTimeDiff = -1;
    this._targetSimulationTime = -1;

    this._serverPointer = {x:-1, y:-1, time:-1};
    this._currentPointer = {x:-1, y:-1, time:-1};
}

Player.prototype.constructor = Player;

Player.prototype = {
    updateBackendPos: function(x, y, time) {
        this._freshHistory.push({'x': x, 'y': y, time: time, simulatedTime: -1});
    },
    updatePointerPosition: function(x, y, time) {
        this._serverPointer.x = x;
        this._serverPointer.y = y;
        this._serverPointer.time = time;
        if (this._currentPointer.x == -1 && this._currentPointer.y == -1) {
            this._currentPointer.x = x;
            this._currentPointer.y = y;
            this._currentPointer.time = time;
        }
    },

    interpolate: function(state, dt) {
        var currentServerTime = Date.now() - Facade.srvDeltaTime - Facade.approxLag;
        if (this._currentPointer.time < this._serverPointer.time) {
            // console.log(this._serverPointer.time, currentServerTime);

            // if (this._currentPointer.time === -1) {
            // this._currentPointer.time = currentServerTime - dt;
            // this._currentPointer.
            // }
        }

        var len = this._freshHistory.length;
        if (this._drained) {
            if (len >= 2) {
                this._drained = false;
            } else {
                return;
            }
        }

        
        var approxBufferTime = currentServerTime - this._freshHistory[0].time;

        var prevPosition = this._oldHistory[this._oldHistory.length-1];
        var current = this._freshHistory[0];
        var oversimulateTime = 0;
        if (current.simulatedTime > 0) {
            var simulatedServerTime = this._startSimulationTimeDiff + this._targetSimulationTime;
            if (currentServerTime > simulatedServerTime) { // this step simulation ended
                oversimulateTime = currentServerTime - simulatedServerTime;

                state.x = current.x;
                state.y = current.y;
                this._targetSimulationTime = -1;
                this._startSimulationTimeDiff = -1;
                this._oldHistory.push(this._freshHistory.shift());

                if (this._freshHistory.length === 0) {
                    this._drained = true;
                    return;
                }
                current = this._freshHistory[0];
                prevPosition = this._oldHistory[this._oldHistory.length-1];
                // return this.interpolate(state);
            }
        }

        if (current.simulatedTime < 0) {
            var timeSpanBetweenActions = current.time - prevPosition.time;
            // console.log(current, prevPosition);
            if (timeSpanBetweenActions > Facade.params.serverUpdateTime*1.1) {
                var actualDist = Phaser.Point.distance(new Phaser.Point(current.x, current.y), new Phaser.Point(prevPosition.x, prevPosition.y));
                var approxDt = Math.floor((actualDist / Facade.params.playerSpeedX) * 1000);
                if (approxDt < Facade.params.serverUpdateTime) {
                    // console.log('recovering from fullStop', currentServerTime, dt, oversimulateTime);
                    this._startSimulationTimeDiff = currentServerTime;
                    this._targetSimulationTime = approxDt - dt;
                    // console.log(this._targetSimulationTime - (currentServerTime - this._startSimulationTimeDiff));
                } else {
                    console.log('WARPING');
                    this._startSimulationTimeDiff = currentServerTime;
                    this._targetSimulationTime = Facade.params.serverUpdateTime/2;
                }
            } else {
                this._startSimulationTimeDiff = currentServerTime;
                this._targetSimulationTime = timeSpanBetweenActions - oversimulateTime;//(oversimulateTime > 0 ? (oversimulateTime + dt) : 0);
                // console.log('continue to move normally for ', this._targetSimulationTime, oversimulateTime);
            }
        }

        current.simulatedTime = currentServerTime;
        var simTimeDt = (currentServerTime - this._startSimulationTimeDiff)/this._targetSimulationTime;
        state.x = this._interpolateValue(prevPosition.x, current.x, simTimeDt);
        state.y = this._interpolateValue(prevPosition.y, current.y, simTimeDt);
    },

    _interpolateValue: function(a, b, t) {
        return a + (b-a)*t;
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

Object.defineProperty(Player.prototype, "lastPointerPos", {
    get: function() {
        return this._serverPointer;
    }
});

Object.defineProperty(Player.prototype, "isMe", {
    get: function() {
        return this._isMe;
    }
});