if ("undefined" !== typeof exports) {
    var Matter = exports.Matter;
}

Simulation = function() {
    this._instantTimeline = new InstantTimeline();
    this._streamTimeline = new StreamTimeline();

    this._physics = new Physics();
};
Simulation.prototype.constructor = Simulation;

Simulation.prototype = {

    addClient: function(clientId, x, y, currentTime) {
        // console.log('sim: adding new client %i at %i:%i on time %i', clientId, x, y, currentTime);
        this._physics.addActorBody(clientId, x, y);
        this._streamTimeline.addClient(clientId, x, y, currentTime);
    },

    deleteClient: function(clientId) {
        // console.log('sim: removing client body and history', clientId);
        this._physics.deleteActorBody(clientId);
        this._streamTimeline.delete(clientId);
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

        var lastAction = this._streamTimeline.getLastAction(clientId);
        var elapsedActionTime = currentTime - clientLag - lerp;
        // var elapsedActionTime = lastAction.startTime + timeDiff - clientLag - lerp;
        if (lastAction.type == StreamActionBase.ActionType.MOVE_ACTION) {
            console.log('%d is moving while shooting. td %d lag %d, lerp %d, ct %d', clientId, timeDiff, clientLag, lerp, currentTime);
        } else {
            console.log('%d is standing still while shooting. td %d lag %d, lerp %d, ct %d', clientId, timeDiff, clientLag, lerp, currentTime);
        }

        this._instantTimeline.add(new InstantAction(clientId, elapsedActionTime, to));
    },

    simulateInstantActions: function(currentTime) {
        var instantData = [];

        while (!this._instantTimeline.isEmpty) {
            var a = this._instantTimeline.shift();
            var backwardsTime = currentTime - a.elapsedExecuteTime;
            console.log('%d\'instant action. windback %d, ct %d', a.clientId, backwardsTime, currentTime);
            
            var windbackState = this._streamTimeline.getCompleteStateAtTime(a.elapsedExecuteTime);
            // var currentState = this._physics.setActorBodyPositionMass(windbackState, true);

            // shoot and determine result here
            instantData.push({id: a.clientId, to: a.shotPoint, hits: []});

            // return to the original state
            // this._physics.setActorBodyPositionMass(currentState);
        }

        return instantData;
    },

    simulateClientStream: function(currentTime, clientId, clientState) {
        // var needToSimulate = this._streamTimeline.hasCurrentActions(clientId);
        var actions = this._streamTimeline.getCurrentActions(clientId);
        if (actions.length === 0) return { change: false, state: null };

        var stateChanged = false;
        var resultState = clientState;

        for (var i = 0; i < actions.length; ++i) {
            resultState = this._simulateAction(clientId, actions[i], currentTime, clientState);
        }

        stateChanged = clientState.x != resultState.x || clientState.y != resultState.y;

        return { change: stateChanged, state: resultState };
    },

    _simulateAction: function(clientId, action, currentTime, startSimState) {
        var startTime;
        var endTime;
        var rollback = false;

        if (action.simulationStarted) {
            startTime = action.simulationTime;
            if (action.ended) {
                if (action.simulationTime > action.endTime) { // rollback
                    rollback = true;
                    // to rollback, we bring body to the start position of action and
                    // play it from the start
                    // console.log('rollback. time: ', action.startTime, action.endTime, action.startState.x - action.currentState.x, action.startState.y - action.currentState.y);
                    this._physics.setActorBodyPosition(
                        clientId, 
                        action.startState.x,
                        action.startState.y
                    );
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
            action.startState.x = startSimState.x;
            action.startState.y = startSimState.y;
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
                return startSimState;
            } else {
                var extra = simAmount % GameParams.dStep;
                endTime = currentTime - extra;
                action.simulationTime = endTime;
            }
        }

        if (startTime == endTime) {
            // console.log('seems like nothing to do');
            return startSimState;
        }

        var resultState = this._physics.simulateTimeSpan(clientId, endTime - startTime, action.velocityX, action.velocityY);
        action.currentState.x = resultState.x;
        action.currentState.y = resultState.y;
        if (action.ended) {
            action.endState.x = resultState.x;
            action.endState.y = resultState.y;
            return action.endState;
        } else {
            return action.currentState;
        }
    }
};

Object.defineProperty(Simulation.prototype, "physics", {
    get: function() {
        return this._physics;
    }
});

if (typeof module !== 'undefined') {
    module.exports.Simulation = new Simulation();
}
