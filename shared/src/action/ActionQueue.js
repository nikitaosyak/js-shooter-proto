if ("undefined" !== typeof exports) {
    var Matter = exports.Matter;
}

ActionQueue = function() {
    /**
     * @type {Array.<StreamAction>}
     * @private
     */
    this._streamTimeline = {};
    /**
     * @type {Array.<InstantAction>}
     * @private
     */
    this._instantTimeline = {};
    this._history = {};
    this._bodies = {};

    this._engine = Matter.Engine.create();
    this._world = Matter.World.create({gravity: {x:0, y:0}});
    this._engine.world = this._world;
};
ActionQueue.prototype.constructor = ActionQueue;

ActionQueue.prototype = {
    addStaticBody: function(b) {
        Matter.Body.setStatic(b, true);
        Matter.World.add(this._world, b);
    },

    addStaticBodies: function(bs) {
        for (var i = 0; i < bs.length; i++) {
            this.addStaticBody(bs[i]);
        }
    },

    addClient: function(clientId, x, y, currentTime) {
        // console.log('queue: adding client body', clientId, x, y);
        var b = Matter.Bodies.circle(x, y, GameParams.playerRadius, null, 32);
        b.friction = 1;
        b.frictionAir = 1;
        b.groupId = 1;
        b.clientId = clientId;

        Matter.World.add(this._world, b);
        this._bodies[clientId] = b;

        var hist = [new StreamAction(clientId, 0, 0, -1)];
        hist[0].state.x = x;
        hist[0].state.y = y;
        hist[0].startTime = hist[0].endTime = hist[0].simulationTime = currentTime;
        this._history[clientId] = hist;
    },

    getClientBody: function(clientId) {
        if (clientId in this._bodies) {
            return this._bodies[clientId];
        }
        return null;
    },

    getAllBodies: function() { return Matter.Composite.allBodies(this._engine.world); },

    deleteClient: function(clientId) {
        console.log('queue: removing client body and history', clientId);
        Matter.World.remove(this._world, this._bodies[clientId]);
        delete this._bodies[clientId];
        delete this._history[clientId];
        delete this._streamTimeline[clientId];
    },

    ray: function(from, to) {
        var bs = Matter.Composite.allBodies(this._engine.world);
        return Matter.Query.ray(bs, from, to);
    },

    addStreamAction: function(currentTime, clientLag, clientId, velX, velY, dt) {
        var addBrandNew = function(_timeline, _cid, _action, _currentTime, _clientLag) {
            _action.startTime = _currentTime - _clientLag;
            // console.log("adding brand new action [", _cid, "] at [", _action.startTime, "]");
            _timeline.push(_action);
        };
        var finalizeAction = function(la, cid, dt) {
            la.endTime = la.startTime + dt;
     //console.log("finalizing last action [", cid, "] at [", la.endTime, "], action len: ", la.length);
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

    /**
     * all numbers are integer
     * @param {Number} currentTime  - server elapsed time
     * @param {Number} clientId     - 
     * @param {Number} clientLag    - half of rtt (last calculated)
     * @param {Number} lerp         - current interpolation time on the client in the moment of action
     * @param {Number} timeDiff     - time since last stream action on client
     * @param {Point}  to           - crosshair point
     */
    addInstantAction: function(currentTime, clientId, clientLag, lerp, timeDiff, to) {
        // console.log('adding')
        var a = this._getLastStreamAction(clientId);
        var historyStreamAction = null;
        var len = 0;
        if (a === null) {
            historyStreamAction = this._history[clientId];
            historyStreamAction = historyStreamAction[historyStreamAction.length-1];
        } else {
            len = this._streamTimeline[clientId].length;
        }

        var elapsedShotTime;
        if (len > 0) {
            a = this._streamTimeline[clientId][0];
            var actionEndTime = a.wasSimulated ? a.simulationTime : a.startTime;
            elapsedShotTime = a.startTime + timeDiff - clientLag - lerp;
            console.log('%d is moving while shooting. lag %d, lerp %d, ct %d', clientId, clientLag, lerp, currentTime);
        } else {
            elapsedShotTime = historyStreamAction.endTime + timeDiff - clientLag - lerp;
            console.log('%d is standing still while shooting. lag %d, lerp %d, ct %d', clientId, clientLag, lerp, currentTime);
        }

        if (!(clientId in this._instantTimeline)) {
            this._instantTimeline[clientId] = [];
        }
        this._instantTimeline[clientId].push(new InstantAction(clientId, elapsedShotTime, to));
    },

    simulateInstantActions: function(currentTime) {
        var instantData = [];

        for (var clientId in this._instantTimeline) {
            var timeline = this._instantTimeline[clientId];

            while (timeline.length > 0) {
                var ia = timeline[0];
                timeline.shift();

                var addedTimeDiff = currentTime - ia.addTime;
                var backwardsTime = currentTime - ia.elapsedExecuteTime;
                console.log('%d\'instant action. windback %d, ct %d', clientId, backwardsTime, currentTime);
                instantData.push({id: clientId, to: ia.shotPoint, hits: []});
            }
        }

        return instantData;
    },

    simulateClientStream: function(currentTime, clientId, clientState) {
        var needToSimulate = this._hasStreamActions(clientId);
        if (!needToSimulate) return false;

        var streamStateChanged = false;
        if (needToSimulate) {
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
                streamStateChanged = startState.x != clientState.x || startState.y != clientState.y;
            }
        }

        return streamStateChanged;
    },

    _simulateStreamPiece: function(clientId, action, currentTime, clientState) {
        var startTime;
        var endTime;

        if (action.wasSimulated) {
            startTime = action.simulationTime;
            if (action.ended) {
                if (action.simulationTime > action.endTime) { // rollback
                    var prevState = this._history[clientId][this._history[clientId].length-1].state;
                    var body = this._bodies[clientId];
                    Matter.Body.translate(body, {x: prevState.x - body.position.x, y: prevState.y - body.position.y});
                    clientState.x = prevState.x;
                    clientState.y = prevState.y;
                    startTime = action.startTime;
                    endTime = action.endTime;
                    // console.log('rolling back: simulating whole action from start: ', (endTime-startTime));
                } else {
                    // ended in a nick of time, all ok
                    endTime = action.endTime;
                    action.simulationTime = action.endTime;
                    // console.log('ended in a nick of time. simulating for', (endTime - startTime));
                }
            }
        } else {
            startTime = action.startTime;
            action.simulationTime = action.startTime;
            if (action.ended) {
                endTime = action.endTime;
                action.simulationTime = action.endTime;
                // console.log('simulating at once for', (endTime - startTime));
            } 
        }

        if (!action.ended) {
            var simAmount = currentTime - action.simulationTime;
            if (simAmount < GameParams.dStep) {
                // console.log('not enough time to simulate, will wait');
                return;
            } else {
                var extra = simAmount % GameParams.dStep;
                endTime = currentTime - extra;
                action.simulationTime = endTime;
            }
            // endTime = currentTime;
            // action.simulationTime = currentTime;
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
        var isAngle = vX !== 0 && vY !== 0;
        if (isAngle) {
            // рассчет для частного случая. говно конечно.
            var vxSign = vX;
            var vySign = vY;
            var hipVel = 1 * Math.cos(45 * Math.PI / 180);
            vX = hipVel * vxSign;
            vY = hipVel * vySign;
        }

        var body = this._bodies[clientId];
        // Matter.Body.update(timespan);

        var extrasim = timespan % GameParams.dStep;
        var simulations = Math.floor(timespan/GameParams.dStep);
        var resultVelocity = GameParams.playerSpeed / (GameParams.dStep * 100);
        for(var i = 0; i < simulations; i++) {
            body.force = {x: vX * resultVelocity, y: vY * resultVelocity};
            Matter.Engine.update(this._engine, GameParams.dStep);
        }
        // console.log('simulated for', GameParams.dStep, i+1, 'times. total span:', timespan);
        if (extrasim > 0) {
            resultVelocity = GameParams.playerSpeed / (extrasim * 100);
            body.force = {x: vX * resultVelocity, y: vY * resultVelocity};
            Matter.Engine.update(this._engine, extrasim);
            // console.log('extrasimulated for', extrasim);   
        }
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

    _hasStreamActions: function(clientId) {
        if (clientId in this._streamTimeline) {
            return this._streamTimeline[clientId].length > 0;
        }
        return false;
    },

    // _hasInstantActions: function(clientId) {
    //     if (clientId in this._instantTimeline) {
    //         return this._instantTimeline[clientId].length > 0;
    //     }
    //     return false;
    // }
};

if (typeof module !== 'undefined') {
    module.exports.queue = new ActionQueue();
}
