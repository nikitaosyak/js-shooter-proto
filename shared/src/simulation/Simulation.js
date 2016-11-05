import {InstantTimeline} from "./action/timeline/InstantTimeline";
import {StreamTimeline} from "./action/timeline/StreamTimeline";
import {PlayerRegistry} from "./PlayerRegistry";

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
            //
            // windback state to approx time of shot:
            let a = this._instantTimeline.shift();
            if (hitClients.indexOf(a.clientId) !== -1) {
                console.log("client is already hit");
                continue;
            }

            let pastState = this._streamTimeline.getCompleteStateAtTime(
                a.elapsedExecuteTime,
                a.clientId
            );
            let currentState = this._physics.rewindActorsPosition(pastState);

            // make raycast:
            let result = this._physics.shootRay(
                this._physics.getActorBody(a.clientId).position,
                a.shotPoint,
                GameParams.playerRadius + 1,
                GameParams.weapons.rayCast.rayLength,
                this._physics.allBodies,
                this._physics
            );

            let hits = [];
            for(let i in result.hits) {
                let b = result.hits[i].body;
                if ('clientId' in b) {
                    if (hitClients.indexOf(b.clientId) === -1) {
                        hits.push(b.clientId);
                    } else {
                        console.log("cannot add already dead player to hits");
                    }
                }
            }

            //
            // add result to pending data
            instantData.push({id: a.clientId, to: result.end, hits: hits});
            hitClients = hitClients.concat(hits);

            // return to the original state
            currentState.forEach(st => {
                this._physics.setActorBodyPosition(st.clientId, st.state.x, st.state.y);
            })
        }

        return instantData;
    }

    simulateStream(currentTime, clientId, clientState) {
        var actions = this._streamTimeline.getCurrentAction(clientId);
        if (actions.length === 0) {
            var constAction = this._streamTimeline.getLastAction(clientId);
            constAction.update(currentTime);
            return { change: false, state: null };
        }

        var stateChanged = false;
        var resultState = clientState;

        for (var i = 0; i < actions.length; ++i) {
            resultState = this._simulateAction(clientId, actions[i], currentTime, resultState);
        }

        stateChanged = clientState.x != resultState.x || clientState.y != resultState.y;

        return { change: stateChanged, state: resultState };
    }

    _simulateAction(clientId, action, currentTime, startSimState) {
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
}
