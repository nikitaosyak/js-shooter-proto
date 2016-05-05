
InstantTimeline = function() {
    this._timeline = [];
    this._sorted = false;
};
InstantTimeline.prototype.constructor = InstantTimeline;

InstantTimeline.prototype = {
    add: function(action) {
        this._sorted = false;
        this._timeline.push(action);
    },

    shift: function() {
        if (!this._sorted) {
            // sorted
        }
        return this._timeline.shift();
    }
};

Object.defineProperty(InstantTimeline.prototype, "maximumEET", {
    get: function() {
        if (this._timeline.length === 0) return 0;
        return this._timeline[0].elapsedExecuteTime;
    }
});

Object.defineProperty(InstantTimeline.prototype, "empty", {
    get: function() {
        return this._timeline.length === 0;
    }
});

if (typeof module !== 'undefined') {
    module.exports.InstantTimeline = InstantTimeline;
}
