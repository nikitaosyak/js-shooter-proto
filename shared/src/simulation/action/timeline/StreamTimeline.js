import {ConstantAction} from "../stream/ConstantAction";

export class StreamTimeline {
    constructor() {
        /**
         * @type {{StreamActionBase}}
         * @private
         */
        this._current = {};
    }

    addClient(clientId, x, y, currentTime) {
        this._current[clientId] = [new ConstantAction(
            clientId,
            currentTime,
            {x: x, y: y}
        )];
    }
    
    removeClient(clientId) { delete this._current[clientId]; }

    addAction(clientId, currentTime, lag, vx, vy, dt) {
        if (!(clientId in this._current)) throw 'StreamTimeline: ' + clientId + ' is not in current';

        let timeline = this._current[clientId];                 // timeline of the client
        let lastAction = this.getLastAction(clientId);          // previous action that is still running (or just ended)
        let endTime = NaN;
        // console.log('adding new action. ct: %s, lag: %s, v: %s:%s, dt: %s', currentTime, lag, vx, vy, dt);

        if (vx === 0 && vy === 0) {
            // console.log('adding stop action');
            endTime = lastAction.startTime + dt;
            timeline.push(new ConstantAction(clientId, endTime, lastAction.endState));
        } else {
            if (lastAction.type == ConstantAction.TYPE) {
                // console.log('started moving', vx, vy);
                endTime = currentTime - lag;
                timeline.push(new MoveAction(clientId, endTime, vx, vy));
            } else {
                // console.log('change direction', vx, vy);
                endTime = lastAction.startTime + dt;
                timeline.push(new MoveAction(clientId, endTime, vx, vy));
            }
        }
        lastAction.end(endTime);

        // var str = '';
        // for (var i = 0; i < timeline.length; ++i) {
        //     var a = timeline[i];
        //     if (a.type == 1) {
        //         str += '[' + Math.round(a.state.x) + ":" + Math.round(a.state.y) + ']';
        //     } else {
        //         str += '[' + Math.round(a.endState.x) + ":" + Math.round(a.endState.y) + ']';
        //     }
        // }
        // console.log(str);

        while (timeline.length > 10) {
            timeline.shift();
        }
    }

    getCurrentAction(clientId) {
        let result = [];
        let t = this._current[clientId];
        let idx = t.length-1;
        while (idx >= 0) {
            if (t[idx].type == ConstantAction.TYPE) {
                idx -= 1;
                continue;
            }
            if (t[idx].simulationEnded) break;
            result.unshift(t[idx]);
            idx -= 1;
        }
        return result;
    }

    getLastAction(clientId) {
        let t = this._current[clientId];
        return t[t.length-1];
    }

    getTimeline(clientId) { return this._current[clientId]; }

    getLastEndedAction(clientId) {
        let t = this._current[clientId];
        if (!t[t.length-1].ended) return t[t.length-2];
        return t[t.length-1];
    }

    getCompleteStateAtTime(time, exceptId) {
        let state = [];
        for (let clientId in this._current) {
            if (clientId == exceptId) continue;
            let t = this._current[clientId];
            for (let i = t.length-1; i >= 0; i--) {
                let a = t[i];
                if (!a.containsTime(time)) continue;
                state.push({clientId: clientId, state: a.getStateAtTime(time)});
                break;
            }
        }
        return state;
    }
}
