
ActionQueue = function() {
    this._streamTimeline = {};
};
ActionQueue.prototype.constructor = ActionQueue;

ActionQueue.prototype = {
    addStreamAction: function(currentTime, clientLag, clientId, velX, velY, dt) {
        var addBrandNew = function(t, cid, a, ct, cl) {
            a.startTime = ct - cl;
            console.log("adding brand new action [", cid, "] at [", a.startTime, "]");
            t.push(a);
        };
        var finalizeAction = function(la, cid, dt) {
            la.endTime = la.startTime + dt;
            console.log("finalizing last action [", cid, "] at [", la.endTime, "], action len: ", la.length);
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
                    console.log("adding streaming action: client: ", clientId);
                    addBrandNew(timeline, clientId, currentAction, lastAction.endTime, 0);
                }
            }
        } else {
            addBrandNew(timeline, clientId, currentAction, currentTime, clientLag);
        }
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
    }
};

if (typeof module !== 'undefined') {
    module.exports.queue = new ActionQueue();
}
