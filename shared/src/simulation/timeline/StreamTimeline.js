
StreamTimeline = function() {
    this._current = {};
    this._history = {};
};
StreamTimeline.prototype.constructor = StreamTimeline;

StreamTimeline.prototype = {
    addClient: function(clientId, x, y, currentTime) {
        var a = new ConstantAction(clientId, currentTime, {x: x, y: y});
        a.end(currentTime);
        this._history[clientId] = [a];
    },

    delete: function(clientId) {
        delete this._current[clientId];
        delete this._history[clientId];
    },

    addAction: function(clientId, currentTime, lag, vx, vy, dt) {
        var addNew = function(onTimeline, _newAction, _currentTime, _lag) {
            _newAction.startTime = _currentTime - _lag;
            // console.log('adding new action on client %s at time %i', _newAction.clientId, _newAction.startTime);
            onTimeline.push(_newAction);
        };

        if (!(clientId in this._current)) {
            this._current[clientId] = [];
        }
        var timeline = this._current[clientId];                 // timeline of the client
        var lastAction = this.getLastStreamAction(clientId);    // previous action that is still running (or just ended)
        var newAction = new MoveAction(clientId, NaN, vx, vy);  // new (current) action that we need to add

        if (lastAction) {
            if (lastAction.ended) {
                addNew(timeline, newAction, currentTime, lag);
            } else {
                lastAction.end(lastAction.startTime + dt);
                // console.log('finalizing action on client %s at time %i, action len: %i', lastAction.clientId, lastAction.endTime, lastAction.duration);

                if (!newAction.isZeroVelocity) { // seamlessly add next action to stream - direction change
                    // console.log('adding streaming action on clinet %s', clientId);
                    addNew(timeline, newAction, lastAction.endTime, 0);
                }
            }
        } else {
            addNew(timeline, newAction, currentTime, lag);
        }
    },

    archiveCompletedActions: function(clientId) {
        var timeline = this._current[clientId];
        var history = this._history[clientId];
        while (timeline.length > 0 && timeline[0].ended) {
            history.push(timeline.shift());
            if (history.length > GameParams.streamingActionsHistoryLen) {
                history.shift();
            }
        }
    },

    hasCurrentActions: function(clientId) {
        if (clientId in this._current) {
            return this._current[clientId].length > 0;
        }
        return false;
    },

    getLastStreamAction: function(clientId) {
        if (clientId in this._current) {
            var timeline = this._current[clientId];
            if (timeline.length > 0) {
                return timeline[timeline.length-1];
            } else {
                return null;
            }
        }
        return null;
    },

    getTimeline: function(clientId) {
        if (clientId in this._current) {
            return this._current[clientId];
        }
        return null;
    },

    getLastCompletedStreamAction: function(clientId) {
        if (clientId in this._history) {
            var h = this._history[clientId];
            return h[h.length-1];
        }
        return null;
    },

    getCompleteStateAtTime: function(time) {
        // var result = {};
        // for (var clientId in this._current) {

        //     var found = false;
        //     var currentTimeline = this._current[clientId];

        //     for (var i = currentTimeline.length-1; i >= 0; --i) {
        //         var a = currentTimeline[i];
        //         if (!a.contains(time)) continue;

        //         var stateAtTime = a.lerpState(time);
        //         result[clientId] = stateAtTime;
        //         found = true;
        //         break;
        //     }

        //     if (found) continue;

        //     var historyTimeline = this._history[clientId];

        // }
        return {};
    },
};

Object.defineProperty(StreamTimeline.prototype, "empty", {
    get: function() {
        return this._timeline.length === 0;
    }
});

if (typeof module !== 'undefined') {
    module.exports.StreamTimeline = StreamTimeline;
}
