
StreamTimeline = function() {
    this._current = {};
};
StreamTimeline.prototype.constructor = StreamTimeline;

StreamTimeline.prototype = {
    addClient: function(clientId, x, y, currentTime) {
        var a = new ConstantAction(clientId, currentTime, {x: x, y: y});
        this._current[clientId] = [a];
    },

    delete: function(clientId) {
        delete this._current[clientId];
    },

    addAction: function(clientId, currentTime, lag, vx, vy, dt) {
        if (!(clientId in this._current)) {
            throw 'unexpected turn of events - client ' + clientId + ' is not in timeline';
        }

        var timeline = this._current[clientId];                 // timeline of the client
        var lastAction = this.getLastAction(clientId);          // previous action that is still running (or just ended)
        var endTime = NaN;
        // console.log('adding new action. ct: %s, lag: %s, v: %s:%s, dt: %s', currentTime, lag, vx, vy, dt);

        if (vx === 0 && vy === 0) {
            // console.log('adding stop action');
            endTime = lastAction.startTime + dt;
            timeline.push(new ConstantAction(clientId, endTime, lastAction.endState));
        } else {
            if (lastAction.type == StreamActionBase.ActionType.CONSTANT_ACTION) {
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
        //     str += '[' + timeline[i].simulationTime + '-' + timeline[i].endTime + ']';
        // }
        // console.log(str);

        while (timeline.length > GameParams.streamingActionsHistoryLen) {
            timeline.shift();
        }
    },

    hasCurrentActions: function(clientId) {
        var a = this.getLastAction(clientId);
        if (a.type == StreamActionBase.ActionType.CONSTANT_ACTION) return false;
        return !a.simulationEnded;
    },

    getCurrentActions: function(clientId) {
        var result = [];
        var t = this._current[clientId];
        var idx = t.length-1;
        while (idx >= 0) {
            if (t[idx].type == StreamActionBase.ActionType.CONSTANT_ACTION) {
                idx -= 1;
                continue;  
            } 
            if (t[idx].simulationEnded) break;
            result.unshift(t[idx]);
            idx -= 1;
        }
        return result;
    },

    getLastAction: function(clientId) {
        var t = this._current[clientId];
        return t[t.length-1];
    },

    getTimeline: function(clientId) {
        return this._current[clientId];
    },

    getLastEndedAction: function(clientId) {
        var t = this._current[clientId];
        if (!t[t.length-1].ended) return t[t.length-2];
        return t[t.length-1];
    },

    getCompleteStateAtTime: function(time, exceptId) {
        var state = [];
        for (var clientId in this._current) {
            if (clientId == exceptId) continue;
            var t = this._current[clientId];
            for (var i = t.length-1; i >= 0; i--) {
                var a = t[i];
                if (!a.containsTime(time)) continue;
                state.push({clientId: clientId, state: a.getStateAtTime(time)});
                break;
            }
        }
        return state;
    },
};

if (typeof module !== 'undefined') {
    module.exports.StreamTimeline = StreamTimeline;
}
