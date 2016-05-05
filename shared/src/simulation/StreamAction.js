
StreamAction = function(clientId, velocityX, velocityY, startTime) {
    this.clientId = clientId;
    this.startTime = startTime;
    this.endTime = -1;
    this.simulationTime = -1;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.state = {x:NaN, y:NaN};

    this.startState = {};
    this.endState = {x:NaN, y: NaN};
};
StreamAction.prototype.constructor = StreamAction;

StreamAction.prototype = {
};

Object.defineProperty(StreamAction.prototype, "isZeroVelocity", {
    get: function() {
        return this.velocityX === 0 && this.velocityY === 0;
    }
});

Object.defineProperty(StreamAction.prototype, "ended", {
    get: function() {
        return this.endTime > 0;
    }
});

Object.defineProperty(StreamAction.prototype, "duration", {
    get: function() {
        if (this.ended) return this.endTime - this.startTime;
        return -1;
    }
});

Object.defineProperty(StreamAction.prototype, "wasSimulated", {
    get: function() {
        return this.simulationTime !== -1;
    }
});

if (typeof module !== 'undefined') {
    module.exports.StreamAction = StreamAction;
}
