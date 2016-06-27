
function ConstantAction(
    clientId,
    startTime,
    state) {
    StreamActionBase.call(this, clientId, startTime, StreamActionBase.ActionType.CONSTANT_ACTION);

    this.state = state;
}
ConstantAction.prototype = Object.create(StreamActionBase.prototype);
ConstantAction.prototype.constructor = ConstantAction;

ConstantAction.prototype.getStateAtTime = function(time) {
    return this.state;
};

if (typeof module !== 'undefined') {
    module.exports.ConstantAction = ConstantAction;
}
