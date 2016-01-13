if ("undefined" !== typeof exports) {
    var Matter = exports.Matter;
}

ActionQueue = function() {
    this._streamTimeline = {};
    this._history = {};
    this._bodies = {};

    this._engine = Matter.Engine.create();
    this._world = Matter.World.create({gravity: {x:0, y:0}});
    this._engine.world = this._world;

};
ActionQueue.prototype.constructor = ActionQueue;

ActionQueue.prototype = {
    addClient: function(clientId, x, y) {
        console.log('queue: adding client body', clientId, x, y);
        var b = Matter.Bodies.circle(x, y, GameParams.playerRadius, null, 32);
        b.friction = 1;
        b.frictionAir = 1;

        Matter.World.add(this._world, b);
        this._bodies[clientId] = b;

        var hist = [new StreamAction(clientId, 0, 0, -1)];
        hist[0].state.x = x;
        hist[0].state.y = y;
        this._history[clientId] = hist;
    },

    deleteClient: function(clientId) {
        // todo: implement this
        console.log('queue: removing client body and history', clientId);
    },

    addStreamAction: function(currentTime, clientLag, clientId, velX, velY, dt) {
        var addBrandNew = function(_timeline, _cid, _action, _currentTime, _clientLag) {
            _action.startTime = _currentTime - _clientLag;
            // console.log("adding brand new action [", _cid, "] at [", _action.startTime, "]");
            _timeline.push(_action);
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

    simulateStream: function(currentTime, clientId, clientState) {
        if (!this._hasCurrentStreamAction(clientId)) return false;

        var startState = {x:clientState.x, y:clientState.y};
        var timeline = this._streamTimeline[clientId];
        var len = timeline.length;
        if (len > 0) {
            for (var i = 0; i < len; i++) {
                this._simulateStreamPiece(clientId, timeline[i], currentTime, clientState);
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

    _simulateStreamPiece: function(clientId, action, currentTime, clientState) {
        var startTime;
        var endTime;

        if (action.wasSimulated) {
            startTime = action.simulationTime;
            if (action.ended) {
                if (action.simulationTime > action.endTime) { // rollback
                    console.log('rolling back: simulating whole action from start');
                    var prevState = this._history[clientId][this._history[clientId].length-1].state;
                    var body = this._bodies[clientId];
                    Matter.Body.translate(body, {x: prevState.x - body.position.x, y: prevState.y - body.position.y});
                    clientState.x = prevState.x;
                    clientState.y = prevState.y;
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

        if (startTime == endTime) {
            // console.log('seems like nothing to do');
            return;
        }

        // console.log(startTime, endTime);
        this._simulateTimeSpan(clientId, endTime - startTime, clientState, action.velocityX, action.velocityY);
        if (action.ended) {
            action.state.x = clientState.x;
            action.state.y = clientState.y;
        }
    },

    _simulateTimeSpan: function(clientId, timespan, state, vX, vY) {
        var speed = GameParams.playerSpeed;
        var resultVelocity = GameParams.playerSpeed / (timespan * 100);
        var body = this._bodies[clientId];
        body.force = {x: vX * resultVelocity, y: vY * resultVelocity};
        Matter.Body.update(body, timespan, 1, 1);
        state.x = body.position.x;
        state.y = body.position.y;
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
