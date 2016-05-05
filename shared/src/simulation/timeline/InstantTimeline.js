
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
            if (this._timeline.length > 1) {
                console.log('sorting timeline of len ' + this._timeline.length);
                this._timeline.sort(function(a, b) {
                    if (a.elapsedExecuteTime > b.elapsedExecuteTime) return -1;
                    if (a.elapsedExecuteTime < b.elapsedExecuteTime) return  1;
                    return 0;
                });
            }
            this._sorted = true;
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
