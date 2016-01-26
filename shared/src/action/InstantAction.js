
InstantAction = function(clientId, addTime, elapsedExecuteTime) {
    this.clientId = clientId;
    this.addTime = addTime;
    this.elapsedExecuteTime = elapsedExecuteTime;
};
InstantAction.prototype.constructor = InstantAction;

InstantAction.prototype = {
};

if (typeof module !== 'undefined') {
    module.exports.InstantAction = InstantAction;
}
