
Player = function(id, startX, startY, name, isMe) {
    console.log("player %i:%s created at %i:%i. is me? %s", id, name, startX, startY, isMe);

    this._id = id;
    this._name = name;
    this._freshHistory = [];
    this._oldHistory = [];
    this._oldHistory.push({'x': startX, 'y': startY, 'time': 0,});
    this._isMe = isMe;

    this._drained = true;
    this._startSimulationTimeDiff = -1;
    this._targetSimulationTime = -1;

    this._pointerSimulationTimeDiff = -1;
    this._pointerTargetSimulationTime = -1;
    this._serverPointer = {x:-1, y:-1, time:-1};
    this._currentPointer = {x:-1, y:-1, simulatedTime:-1};
};

Player.prototype.constructor = Player;

Player.prototype = {
    updateBackendPos: function(x, y, time) {
        this._freshHistory.push({'x': x, 'y': y, time: time, simulatedTime: -1});
    },
    updatePointerPosition: function(x, y, time) {
        // console.log('new point:', x, y);
        this._serverPointer.x = x;
        this._serverPointer.y = y;
        this._serverPointer.time = time;
        if (this._currentPointer.x == -1 && this._currentPointer.y == -1) {
            this._currentPointer.x = x;
            this._currentPointer.y = y;
        } else {
            this._currentPointer.simulatedTime = -1;
        }
    },

    interpolate: function(state, pointerState, dt) {
        var srvDelta = Facade.connection.sync.srvDelta;
        var lag = Facade.connection.sync.lag;
        var currentServerTime = Date.now() - srvDelta - lag;

        this._interpolatePointer(pointerState, currentServerTime, dt);

        var len = this._freshHistory.length;
        if (this._drained) {
            if (len >= Facade.params.interpolationSnapshotBuffer) {
                this._drained = false;
            } else {
                return;
            }
        }

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
                if (this._oldHistory.length > 10) {
                    this._oldHistory.shift();
                }

                if (this._freshHistory.length === 0) {
                    this._drained = true;
                    return;
                }
                current = this._freshHistory[0];
                prevPosition = this._oldHistory[this._oldHistory.length-1];
            }
        }

        if (current.simulatedTime < 0) {
            var timeSpanBetweenActions = current.time - prevPosition.time;
            // console.log(current, prevPosition);
            if (timeSpanBetweenActions > Facade.params.serverUpdateTime*1.1) {
                var actualDist = Phaser.Point.distance(new Phaser.Point(current.x, current.y), new Phaser.Point(prevPosition.x, prevPosition.y));
                var approxDt = Math.floor((actualDist / Facade.params.playerSpeed) * 1000);
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
        simTimeDt = Math.min(simTimeDt, 1);
        state.x = this._interpolateValue(prevPosition.x, current.x, simTimeDt);
        state.y = this._interpolateValue(prevPosition.y, current.y, simTimeDt);
    },

    _interpolatePointer: function(state, currentTime, dt) {
        if (this._currentPointer.x == this._serverPointer.x && this._currentPointer.y == this._serverPointer.y) return;
        if (this._currentPointer.simulatedTime > 0) {
            var simulatedServerTime = this._pointerSimulationTimeDiff + this._pointerTargetSimulationTime;
            if (currentTime > simulatedServerTime) {
                this._currentPointer.x = this._serverPointer.x;
                this._currentPointer.y = this._serverPointer.y;
            }
        }

        if (this._currentPointer.simulatedTime < 0) {
            this._currentPointer.x = state.x;
            this._currentPointer.y = state.y;
            this._pointerSimulationTimeDiff = currentTime;
            this._pointerTargetSimulationTime = Facade.params.serverUpdateTime * 1.5;
        }

        this._currentPointer.simulatedTime = currentTime;
        var simTimeDt = (currentTime - this._pointerSimulationTimeDiff)/this._pointerTargetSimulationTime;
        simTimeDt = Math.min(simTimeDt, 1);
        state.x = this._interpolateValue(this._currentPointer.x, this._serverPointer.x, simTimeDt);
        state.y = this._interpolateValue(this._currentPointer.y, this._serverPointer.y, simTimeDt);
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

Object.defineProperty(Player.prototype, "name", {
    get: function() {
        return this._name;
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

Object.defineProperty(Player.prototype, "simulatedPointerPos", {
    get: function() {
        return this._currentPointer;
    }
});

Object.defineProperty(Player.prototype, "isMe", {
    get: function() {
        return this._isMe;
    }
});