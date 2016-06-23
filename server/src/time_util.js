var GameParams = require('./shared.gen.js').GameParams;

function TimeUtil() {
    this._started = Date.now();
    this._lastUpdate = this._started;
    this._callback = null;
    this._longCallback = null;
    setInterval(this._onTimer, GameParams.serverUpdateTime, this);
    setInterval(this._onLongTimer, GameParams.rttCheckTimeout, this);
}
TimeUtil.prototype.constructor = TimeUtil;

TimeUtil.prototype = {
    onTimer : function(callback) {
        this._callback = callback;
    },
    onLongTimer: function(callback) {
        this._longCallback = callback;
    },
    _onTimer: function(context) {
        if (!context._callback) return;
        var now = Date.now();
        var dt = now - context._lastUpdate;
        context._lastUpdate = now;
        context._callback(dt);
    },
    _onLongTimer: function(context) {
        if (!context._longCallback) return;
        context._longCallback();
    }
};

Object.defineProperty(TimeUtil.prototype, "elapsed", {
    get: function() {
        return Date.now() - this._started;
    }
});

Object.defineProperty(TimeUtil.prototype, "now", {
    get: function() {
        return Date.now();
    }
});

module.exports = new TimeUtil();