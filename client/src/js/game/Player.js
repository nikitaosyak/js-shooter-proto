
Player = function(id, startX, startY, isMe) {
    console.log("player %i created at %i:%i. is me? %s", id, startX, startY, isMe);

    this._id = id;
    this._freshHistory = [];
    this._currentSnapshot = null;
    this._oldHistory = [];
    this._oldHistory.push({'x': startX, 'y': startY, 'time': 0,});
    this._isMe = isMe;

    this._drained = true;
    this._startSimulationTimeDiff = -1;
    this._targetSimulationTime = -1;
    this._simTimeDiff = -1;
    // this._maximumBufferTime = Facade.params.serverUpdateTime * 2.2;
}

Player.prototype.constructor = Player;

Player.prototype = {
    updateBackendPos: function(x, y, time) {
        this._freshHistory.push({'x': x, 'y': y, time: time, simulatedTime: -1});
    },

    interpolate: function(state) {
        var len = this._freshHistory.length;
        if (this._drained) {
            if (len >= 1) {
                this._drained = false;
            } else {
                return;
            }
        }

        var currentServerTime = Date.now() - Facade.srvDeltaTime - Facade.approxLag;
        var approxBufferTime = currentServerTime - this._freshHistory[0].time;

        if (!this._currentSnapshot) {
            this._currentSnapshot = this._freshHistory[0];
        }

        var prevPosition = this._oldHistory[this._oldHistory.length-1];
        var current = this._currentSnapshot;
        if (current.simulatedTime > 0) {
            if (current.simulatedTime > this._startSimulationTimeDiff + this._targetSimulationTime) { // this step simulation ended
                // console.log('end simulation step');
                this._targetSimulationTime = -1;
                this._startSimulationTimeDiff = -1;
                this._simTimeDiff = -1;
                this._oldHistory.push(this._freshHistory.shift());
                this._currentSnapshot = null;

                if (this._freshHistory.length == 0) {
                    this._drained = true;
                    return;
                }
                return this.interpolate(state);
            }
        } else {
            var dt = current.time - prevPosition.time;
            if (dt > Facade.params.serverUpdateTime*1.1) {
                var actualDist = Phaser.Point.distance(new Phaser.Point(current.x, current.y), new Phaser.Point(prevPosition.x, prevPosition.y));
                var approxDt = Math.floor((actualDist / Facade.params.playerSpeedX) * 1000);
                if (approxDt < Facade.params.serverUpdateTime) {
                    console.log('recovering from fullStop');
                    this._startSimulationTimeDiff = currentServerTime - 16;
                    this._targetSimulationTime = approxDt;
                } else {
                    console.log('WARPING');
                    this._startSimulationTimeDiff = currentServerTime - 16;
                    this._targetSimulationTime = Facade.params.serverUpdateTime/2;
                }
            } else {
                // console.log('continue to move normally for ', dt);
                this._startSimulationTimeDiff = currentServerTime - 16;
                this._targetSimulationTime = dt;
            }
        }
        current.simulatedTime = currentServerTime;
        var simTimeDt = (currentServerTime - this._startSimulationTimeDiff)/this._targetSimulationTime;
        // console.log(simTimeDt);
        state.x = this._interpolateValue(prevPosition.x, current.x, simTimeDt);
        state.y = this._interpolateValue(prevPosition.y, current.y, simTimeDt);

        // console.log(simTime/endSimTime, currentServerTime);
        // console.log(approxBufferTime);
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

Object.defineProperty(Player.prototype, "isMe", {
    get: function() {
        return this._isMe;
    }
});