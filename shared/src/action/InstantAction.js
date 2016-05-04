
InstantAction = function(clientId, elapsedExecuteTime, shotPoint) {
    this.clientId = clientId;
    this.elapsedExecuteTime = elapsedExecuteTime;
    this.shotPoint = shotPoint;
};
InstantAction.prototype.constructor = InstantAction;

InstantAction.prototype = {
};

if (typeof module !== 'undefined') {
    module.exports.InstantAction = InstantAction;
}
