
State = function() {
    console.log("network state created");
    this._me = null;
    this._players = {};
    this.newPlayers = [];
}

State.prototype.constructor = State;

State.prototype = {
    addMe: function(me) {
        this._me = me;
        this.addPlayer(me);
    },

    addPlayer: function(player) {
        this._players[player.id] = player;
        this.newPlayers.push(player.id);
    },

    removePlayerById: function(playerId) {
        delete this._players[playerId];
    },

    removePlayer: function(player) {
        delete this._players[player.id];
    },

    addPlayerPos: function(playerId, x, y, time) {
        this._players[playerId].updateBackendPos(x, y, time);
    },

    setPlayerPos: function(playerId, x, y) {
        this.addPlayer(new Player(playerId, x, y, false));
    },
};

Object.defineProperty(State.prototype, "players", {
    get: function() {
        return this._players;
    }
});

Object.defineProperty(State.prototype, "me", {
    get: function() {
        return this._me;
    }
});

Object.defineProperty(State.prototype, "myClientId", {
    get: function() {
        return this._me.id;
    }
});