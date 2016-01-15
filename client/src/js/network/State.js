
State = function() {
    console.log("network state created");
    this._me = null;
    this._players = {};
    this.newPlayers = [];
    this.removedPlayers = [];
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
        this.removedPlayers.push(playerId);
        delete this._players[playerId];
    },

    addPlayerPos: function(playerId, x, y, time) {
        this._players[playerId].updateBackendPos(x, y, time);
    },

    setPointerLocation: function(playerId, x, y, time) {
        this._players[playerId].updatePointerPosition(x, y, time);
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