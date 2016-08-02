import {InstantTimeline} from "./action/timeline/InstantTimeline";
import {StreamTimeline} from "./action/timeline/StreamTimeline";
import {PlayerRegistry} from "./PlayerRegistry";

Simulation.prototype = {

    simulateInstantActions: function(currentTime) {
        var instantData = [];
        var hitClients = [];

        while (!this._instantTimeline.isEmpty) {
            //
            // windback state to approx time of shot
            var action = this._instantTimeline.shift();
            if (hitClients.indexOf(action.clientId) !== -1) {
                console.log("this client is already dead!");
                continue;
            }

            // var backwardsTime = currentTime - action.elapsedExecuteTime;
            // console.log('%d\'instant action. windback %d, ct %d', action.clientId, backwardsTime, currentTime);
            var windbackState = this._streamTimeline.getCompleteStateAtTime(
                action.elapsedExecuteTime,
                action.clientId
            );
            // console.log('windbackState: ', windbackState);
            
            var currentState = this._physics.rewindActorsPosition(windbackState);

            //
            // make a raycast
            var myPosition = this._physics.getActorBody(action.clientId).position;
            var startOffset = GameParams.playerRadius + 1;
            var rayLen = GameParams.weapons.rayCast.rayLength;

            var result = this._physics.shootRay(
                myPosition,
                action.shotPoint,
                startOffset,
                rayLen,
                this._physics.allBodies,
                this._physics
            );

            var hits = [];
            for (var i in result.hits) {
                var b = result.hits[i].body;
                if ('clientId' in b) {
                    if (hitClients.indexOf(b.clientId) === -1) {
                        hits.push(b.clientId);
                    } else {
                        console.log("cannot add already dead player to hits");
                    }
                }
            }
            // console.log(hits);

            //
            // add result to pending data
            instantData.push({id: action.clientId, to: result.end, hits: hits});
            hitClients = hitClients.concat(hits);

            // return to the original state
            this._physics.setActorBodyPositionMass(currentState);
        }

        return instantData;
    },

    simulateClientStream: function(currentTime, clientId, clientState) {
        // var needToSimulate = this._streamTimeline.hasCurrentActions(clientId);
        var actions = this._streamTimeline.getCurrentActions(clientId);
        if (actions.length === 0) {
            var constAction = this._streamTimeline.getLastAction(clientId);
            constAction.update(currentTime);
            // if (isNaN(constAction.state.x)) {
                // var t = this._streamTimeline.getTimeline(clientId);
                // var str = '';
                // for (var i = 0; i < t.length; ++i) {
                //     var a = t[i];
                //     if (a.type == 1) {
                //         // str += '[c' + Math.round(a.state.x) + ":" + Math.round(a.state.y) + ']';
                //     } else {
                //         // str += '[m' + a.startTime + ":" + a.simulationTime + ":" + a.endTime;
                //         str += '[::' + Math.round(a.startState.x) + ":" + Math.round(a.startState.y);
                //         str += '::' + Math.round(a.endState.x) + ":" + Math.round(a.endState.y) + ']';
                //     }
                // }
                // console.log(str);
            // }
            return { change: false, state: null };
        } 

        var stateChanged = false;
        var resultState = clientState;

        for (var i = 0; i < actions.length; ++i) {
            // srsly, break a fucking leg, programming. if only i could do music
            resultState = this._simulateAction(clientId, actions[i], currentTime, resultState);
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
                if (action.simulationTime > action.endTime ) { // rollback
                    rollback = true;
                    // to rollback, we bring body to the start position of action and
                    // play it from the start
                    // console.log('rollback. time: ', action.startTime, action.endTime, action.startState.x - action.currentState.x, action.startState.y - action.currentState.y);
                    // console.log('rollback. ', action.startState);
                    this._physics.setActorBodyPosition(
                        clientId, 
                        action.startState.x,
                        action.startState.y
                    );
                    startTime = action.startTime;
                    endTime = action.endTime;
                    action.simulationTime = action.endTime;
                    // console.log('rolling back: simulating whole action from start: ', (endTime-startTime));
                } else {
                    // ended in a nick of time, all ok
                    endTime = action.endTime;
                    action.simulationTime = action.endTime;
                    // console.log('ended in a nick of time. simulating for', (action.endTime - action.startTime));
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
            // OHUENNII HOTFIX
            if (action.ended && action.startTime === action.endTime) {
                action.endState.x = action.startState.x;
                action.endState.y = action.startState.y;
            }
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

export class Simulation {
    /**
     * @param physicsInjection {Physics}
     */
    constructor(physicsInjection) {
        this._instantTimeline = new InstantTimeline();
        this._streamTimeline = new StreamTimeline();
        this._registry = new PlayerRegistry();
        this._physics = physicsInjection;
        
        console.log('Simulation: created');
    }

    /** @returns {Physics} */
    get physics() { return this._physics; }
    /** @returns {PlayerRegistry} */
    get registry() { return this._registry; }
    /** @returns {StreamTimeline} */
    get stream() { return this._streamTimeline; }
    /** @returns {InstantTimeline} */
    get instant() { return this._instantTimeline; }
    
    addPlayer(clientId, x, y, currentTime) {
        let p = this._registry.addPlayer(clientId, x, y);
        this._physics.addActorBody(p.id, p.pos.x, p.pos.y);
        this._streamTimeline.addClient(p.id, p.pos.x, p.pos.y, currentTime);
        return p;
    }
    
    deletePlayer(clientId) {
        this._registry.checkPlayerExist(clientId);
        this._physics.deleteActorBody(clientId);
        this._streamTimeline.removePlayer(clientId);
        this._registry.removePlayer(clientId);
    }

    simulateInstant(currentTime) {
        let instantData = [];
        let hitClients = [];

        while(!this._instantTimeline.isEmpty) {
            
        }
    }
}