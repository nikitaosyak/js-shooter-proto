Interpolator = function() {
    console.log('interpolator created');
    this._nodes = {};
    this.lerpTime = 0;
};

Interpolator.prototype.constructor = Interpolator;

Interpolator.prototype = {
    addNode: function(id, startState) {
        this._nodes[id] = new InterpolatorNode(id, startState);
    },

    addPosition: function(id, x, y, time) {
        this._node[id].addPosition(x, y, time);
    },

    addPointerPosition: function(id, x, y, time) {
        this._node[id].addPointerPosition(x, y, time);
    },

    update: function(dt) {

    },


    //
    // for visual state

    getServerPosition: function(id) { return this._node[id].serverPosition; },
    getLerpPosition: function(id) { return this._node[id].lerpPosition; },
    getLerpPointerPosition: function(id) { return this._node[id].lerpPointerPosition; },
};