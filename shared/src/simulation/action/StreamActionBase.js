//
// stateless abstract stream action

function StreamActionBase(
    clientId,
    startTime,
    actionType) {
    this.clientId = clientId;
    this.startTime = startTime;
    this.simulationTime = NaN;
    this.endTime = NaN;

    this._actionType = actionType;
}

StreamActionBase.ActionType = {
    CONSTANT_ACTION: 1,
    MOVE_ACTION: 2
};

StreamActionBase.prototype.constructor = StreamActionBase;

StreamActionBase.prototype = {
    update: function (simulationTime) {
        this.simulationTime = simulationTime;
    },

    end: function(endTime) {
        this.endTime = endTime;
    },

    containsTime: function(time) {
        if (this.ended) {
            return time >= this.startTime && time <= this.endTime;
        } else {
            return time >= this.startTime && time <= this.simulationTime;
        }
    },

    getStateAtTime: function(time) {
        throw "override this abstract method in descendants";
    }
};

Object.defineProperty(StreamActionBase.prototype, "type", {
    get: function() {
        return this._actionType;
    }
});

Object.defineProperty(StreamActionBase.prototype, "simulationStarted", {
    get: function() {
        return !isNaN(this.simulationTime);
    }
});

Object.defineProperty(StreamActionBase.prototype, "simulationEnded", {
    get: function() {
        return this.simulationTime === this.endTime;
    }
});

Object.defineProperty(StreamActionBase.prototype, "ended", {
    get: function() {
        return !isNaN(this.endTime);
    }
});

Object.defineProperty(StreamActionBase.prototype, "duration", {
    get: function() {
        if (this.ended) {
            return this.endTime - this.startTime;  
        } else {
            return this.simulationTime - this.startTime;
        }
    }
});

if (typeof module !== 'undefined') {
    module.exports.StreamActionBase = StreamActionBase;
}
