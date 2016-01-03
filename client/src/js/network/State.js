
State = function() {
    console.log("state created");
    this._me = null;
    this._players = {};
}

State.prototype.constructor = State;
State.myClientId = -1;

State.prototype = {
    addMe: function(me) {
        State.myClientId = me.id;
        this._clientMe = me;
        this.addPlayer(me);
    },

    addPlayer: function(player) {
        this._players[player.id] = player;
    },

    removePlayerById: function(playerId) {
        delete this._players[playerId];
    },

    removePlayer: function(player) {
        delete this._players[player.id];
    }
};

Object.defineProperty(State.prototype, "players", {
    get: function() {
        return this._players;
    }
});

Object.defineProperty(State.prototype, "me", {
    get: function() {
        return this._clientMe;
    }
});

Object.defineProperty(State.prototype, "serverMe", {
    get: function() {
        return this._serverMe;
    }
});