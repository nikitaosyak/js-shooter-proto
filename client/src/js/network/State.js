
State = function() {
    console.log("network state created");
    this._me = null;
    this._players = {};
    this.newPlayers = [];
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
        this.newPlayers.push(player.id);
    },

    removePlayerById: function(playerId) {
        delete this._players[playerId];
    },

    removePlayer: function(player) {
        delete this._players[player.id];
    },

    addPlayerPos: function(playerId, x, y, time) {
        if (playerId in this._players) {
            this._players[playerId].updateBackendPos(x, y, time);
        } else {
            // console.log('player %i arrived at %i:%i', playerId, x, y);
            this.addPlayer(new Player(playerId, x, y, time, false));
        }
    },
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