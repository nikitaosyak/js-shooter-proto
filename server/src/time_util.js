
TimeUtil = function() {
    this._started = Date.now();
};
TimeUtil.prototype.constructor = TimeUtil;

TimeUtil.prototype = {
    
};

Object.defineProperty(TimeUtil.prototype, "elapsed", {
    get: function() {
        return Date.now() - this._started;
    }
});

module.exports = new TimeUtil();