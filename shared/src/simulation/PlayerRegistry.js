function PlayerRegistry() {
    this._players = {};
}

PlayerRegistry.prototype.constructor = PlayerRegistry;

PlayerRegistry.prototype = {

    addPlayer: function(id, x, y) {
        if (this.hasPlayer(id)) throw "registry: already contains player " + id;
        var p = new Player(id, x, y);
        this._players[id] = p;
        return p;
    },

    hasPlayer: function(id) {
        return id in this._players;
    },

    removePlayer: function(id) {
        if (!this.hasPlayer(id)) throw "registry: already does not have player " + id;
        this._players[id].destroyPlayer();
        delete this._players[id];
    },

    getPlayer: function(id) {
        if (!this.hasPlayer(id)) throw "registry: does not contains player " + id;
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