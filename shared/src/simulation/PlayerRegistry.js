PlayerRegistry = function() {
    this._players = {};
};

PlayerRegistry.prototype.constructor = PlayerRegistry;

PlayerRegistry.prototype = {

    addPlayer: function(id, x, y) {
        if (this.hasPlayer(id)) throw "already contains player " + id;
        var p = new Player(id, x, y);
        this._players[id] = p;
        return p;
    },

    hasPlayer: function(id) {
        return id in this._players;
    },

    removePlayer: function(id) {
        if (!this.hasPlayer(id)) throw "already does not have player " + id;
        this._players[id].destroy();
        delete this._players[id];
    },

    getPlayer: function(id) {
        if (!this.hasPlayer(id)) throw "does not contains player " + id;
        return this._players[id];
    },

    iteratePlayers: function(iterator) {
        for (var k in this._players) {
            iterator(this._players[k]);
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports.PlayerRegistry = PlayerRegistry;
}