
function MoveAction(
    clientId,
    startTime,
    vX,
    vY) {
    StreamActionBase.call(this, clientId, startTime, StreamActionBase.ActionType.MOVE_ACTION);

    this.velocityX = vX;
    this.velocityY = vY;

    this.currentState = {x: NaN, y: NaN};
    this.startState = {x: NaN, y: NaN};
    this.endState = {x: NaN, y: NaN};
}

MoveAction.prototype = Object.create(StreamActionBase.prototype);
MoveAction.prototype.constructor = MoveAction;

MoveAction.prototype.getStateAtTime = function(time) {
    var t = (time - this.startTime) / this.duration;

    if (this.ended) {
        return {
            x: SharedUtils.lerp(this.startState.x, this.endState.x, t),
            y: SharedUtils.lerp(this.startState.y, this.endState.y, t),
        };
    } else {
        return {
            x: SharedUtils.lerp(this.startState.x, this.currentState.x, t),
            y: SharedUtils.lerp(this.startState.y, this.currentState.y, t),
        };
    }
};

Object.defineProperty(MoveAction.prototype, "isZeroVelocity", {
    get: function() {
        return this.velocityX === 0 && this.velocityY === 0;
    }
});

if (typeof module !== 'undefined') {
    module.exports.MoveAction = MoveAction;
}
