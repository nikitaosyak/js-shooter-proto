var GameParams = require('./shared.gen.js').GameParams;

TimeUtil = function() {
    this._started = Date.now();
    this._lastUpdate = this._started;
    this._callback = null;
    setInterval(this._onTimer, GameParams.serverUpdateTime, this);
};
TimeUtil.prototype.constructor = TimeUtil;

TimeUtil.prototype = {
    onTimer : function(callback) {
        this._callback = callback;
    },
    _onTimer: function(context) {
        if (!context._callback) return;
        var now = Date.now();
        var dt = now - context._lastUpdate;
        context._lastUpdate = now;
        context._callback(dt);
    }
};

Object.defineProperty(TimeUtil.prototype, "elapsed", {
    get: function() {
        return Date.now() - this._started;
    }
});

module.exports = new TimeUtil();