if ("undefined" !== typeof exports) {
    var cp = exports;
    var Matter = exports.Matter;
}

ActionQueue = function() {
    this._streamTimeline = {};
    this._history = {};
    this._bodies = {};

    // var e = Matter.Engine;
};
ActionQueue.prototype.constructor = ActionQueue;

ActionQueue.prototype = {
    addClient: function(clientId, x, y) {
        console.log('queue: adding client body', clientId, x, y);
    },

    deleteClient: function(clientId) {
        // todo: implement this
        console.log('queue: removing client body and history', clientId);
    },

    addStreamAction: function(currentTime, clientLag, clientId, velX, velY, dt) {
        var addBrandNew = function(t, cid, a, ct, cl) {
            a.startTime = ct - cl;
            // console.log("adding brand new action [", cid, "] at [", a.startTime, "]");
            t.push(a);
        };
        var finalizeAction = function(la, cid, dt) {
            la.endTime = la.startTime + dt;
    // console.log("finalizing last action [", cid, "] at [", la.endTime, "], action len: ", la.length);
        };

        var lastAction = this._getLastStreamAction(clientId);
        var timeline = this._streamTimeline[clientId];
        var startTime = -1;
        var currentAction = new StreamAction(clientId, velX, velY, startTime);

        if (lastAction) {
            if (lastAction.ended) {
                addBrandNew(timeline, clientId, currentAction, currentTime, clientLag);
            } else {
                if (currentAction.isZeroVelocity) {
                    finalizeAction(lastAction, clientId, dt);
                } else {
                    finalizeAction(lastAction, clientId, dt);
                    // console.log("adding streaming action: client: ", clientId);
                    addBrandNew(timeline, clientId, currentAction, lastAction.endTime, 0);
                }
            }
        } else {
            addBrandNew(timeline, clientId, currentAction, currentTime, clientLag);
        }
    },

    simulateStream: function(currentTime, clientId, clientState, speedX, speedY) {
        if (!this._hasCurrentStreamAction(clientId)) return false;

        var startState = {x:clientState.x, y:clientState.y};
        var timeline = this._streamTimeline[clientId];
        var len = timeline.length;
        if (len > 0) {
            for (var i = 0; i < len; i++) {
                this._simulateStreamPiece(timeline[i], currentTime, clientState, speedX, speedY);
            }

            var clientHistory = this._history[clientId];
            while(timeline.length > 0 && timeline[0].ended) {
                clientHistory.push(timeline.shift());
                if(clientHistory.length > 20) {
                    clientHistory.shift();
                }
            }    
            return startState.x != clientState.x || startState.y != clientState.y;
        }
        return false;
    },

    _simulateStreamPiece: function(action, currentTime, clientState, sX, sY) {
        var startTime;
        var endTime;

        if (action.wasSimulated) {
            startTime = action.simulationTime;
            if (action.ended) {
                if (currentTime >= action.endTime) { // rollback
                    var dt = action.simulationTime - action.startTime;
                    this._simulateTimeSpan(dt, clientState, sX, sY, -action.velocityX, -action.velocityY);
                    startTime = action.startTime;
                    endTime = action.endTime;
                } else {
                    // ended in a nick of time, all ok
                    endTime = action.endTime;
                    action.simulationTime = action.endTime;
                }
            }
        } else {
            startTime = action.startTime;
            if (action.ended) {
                endTime = action.endTime;
                action.simulationTime = action.endTime;
            } 
        }
        if (!action.ended) {
            endTime = currentTime;
            action.simulationTime = currentTime;
        }

        // console.log(startTime, endTime);
        this._simulateTimeSpan(endTime - startTime, clientState, sX, sY, action.velocityX, action.velocityY);
    },

    _simulateTimeSpan: function(timespan, state, sX, sY, vX, vY) {
        var isAngle = vX !== 0 && vY !== 0;
        if (isAngle) {
            // рассчет для частного случая. говно конечно.
            var vxSign = vX;
            var vySign = vY;
            var hipVel = 1 * Math.cos(45 * Math.PI / 180);
            vX = hipVel * vxSign;
            vY = hipVel * vySign;
        }
        var dt = timespan/1000;
        state.x += sX * vX * dt;
        state.y += sY * vY * dt;
    },

    _getLastStreamAction: function(clientId) {
        if (clientId in this._streamTimeline) {
            var timeline = this._streamTimeline[clientId];
            var timelineLen = timeline.length;
            if (timelineLen > 0) {
                return timeline[timeline.length-1];
            }
            return null;
        } 
        this._streamTimeline[clientId] = [];
        this._history[clientId] = [];
        return null;
    },

    _hasCurrentStreamAction: function(clientId) {
        if (clientId in this._streamTimeline) {
            return this._streamTimeline[clientId].length > 0;
        }
        return false;
    }
};

if (typeof module !== 'undefined') {
    module.exports.queue = new ActionQueue();
}
