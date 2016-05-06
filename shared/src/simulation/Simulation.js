if ("undefined" !== typeof exports) {
    var Matter = exports.Matter;
}

Simulation = function() {
    this._instantTimeline = new InstantTimeline();
    this._streamTimeline = new StreamTimeline();

    this._bodies = {};
    this._engine = Matter.Engine.create();
    this._world = Matter.World.create({gravity: {x:0, y:0}});
    this._engine.world = this._world;
};
Simulation.prototype.constructor = Simulation;

Simulation.prototype = {
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
        var b = Matter.Bodies.circle(x, y, GameParams.playerRadius, null, 32);
        b.friction = 1;
        b.frictionAir = 1;
        b.groupId = 1;
        b.clientId = clientId;

        Matter.World.add(this._world, b);
        this._bodies[clientId] = b;

        this._streamTimeline.addClient(clientId, x, y, currentTime);
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
        this._streamTimeline.delete(clientId);

        Matter.World.remove(this._world, this._bodies[clientId]);
        delete this._bodies[clientId];
    },

    ray: function(from, to) {
        var bs = Matter.Composite.allBodies(this._engine.world);
        return Matter.Query.ray(bs, from, to);
    },

    addStreamAction: function(currentTime, clientLag, clientId, velX, velY, dt) {
        this._streamTimeline.addAction(clientId, currentTime, clientLag, velX, velY, dt);
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
        var elapsedActionTime;

        if (this._streamTimeline.hasCurrentActions(clientId)) {
            var lastStreamAction = this._streamTimeline.getLastStreamAction(clientId);
            elapsedActionTime = lastStreamAction.startTime + timeDiff - clientLag - lerp;
            console.log('%d is moving while shooting. lag %d, lerp %d, ct %d', clientId, clientLag, lerp, currentTime);
        } else {
            var historyAction = this._streamTimeline.getLastCompletedStreamAction(clientId);
            elapsedActionTime = historyAction.endTime + timeDiff - clientLag - lerp;
            console.log('%d is standing still while shooting. lag %d, lerp %d, ct %d', clientId, clientLag, lerp, currentTime);
        }

        this._instantTimeline.add(new InstantAction(clientId, elapsedActionTime, to));
    },

    simulateInstantActions: function(currentTime) {
        var instantData = [];

        while (!this._instantTimeline.empty) {
            var a = this._instantTimeline.shift();
            var backwardsTime = currentTime - a.elapsedExecuteTime;
            console.log('%d\'instant action. windback %d, ct %d', a.clientId, backwardsTime, currentTime);
            instantData.push({id: a.clientId, to: a.shotPoint, hits: []});
        }

        return instantData;
    },

    simulateClientStream: function(currentTime, clientId, clientState) {
        var needToSimulate = this._streamTimeline.hasCurrentActions(clientId);
        if (!needToSimulate) return false;

        var streamStateChanged = false;
        if (needToSimulate) {
            var startState = {x:clientState.x, y:clientState.y};
            var timeline = this._streamTimeline.getTimeline(clientId);
            var len = timeline.length;
            if (len > 0) {
                for (var i = 0; i < len; i++) {
                    this._simulateStreamPiece(clientId, timeline[i], currentTime, clientState);
                }

                this._streamTimeline.archiveCompletedActions(clientId);

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
                if (action.simulationTime >= action.endTime) { // rollback
                    // to rollback, we bring body to the start position of action and
                    // play it from the start
                    Matter.Body.translate(
                        this._bodies[clientId], 
                        {
                            x: action.startState.x - action.currentState.x, 
                            y: action.startState.y - action.currentState.y
                        }
                    );
                    clientState.x = action.startState.x; 
                    clientState.y = action.startState.y;
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
            // console.log('remembered start state of %i:%i', clientState.x, clientState.y);
            action.startState.x = clientState.x;
            action.startState.y = clientState.y;
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
        }

        if (startTime == endTime) {
            // console.log('seems like nothing to do');
            return;
        }

        this._simulateTimeSpan(clientId, endTime - startTime, clientState, action.velocityX, action.velocityY);
        action.currentState.x = clientState.x;
        action.currentState.y = clientState.y;
        if (action.ended) {
            action.endState.x = clientState.x;
            action.endState.y = clientState.y;
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
};

if (typeof module !== 'undefined') {
    module.exports.Simulation = new Simulation();
}
