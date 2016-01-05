
VisualState = function(game, networkState) {
    console.log("visual state created");
    this._game = game;
    this._networkState = networkState;
    this._group = new Phaser.Group(game, game.world);
    game.world.add(this._group);

    this._serverMe = null;
    this._clientMe = null;
    this._serverPlayers = {};
}

VisualState.prototype.constructor = VisualState;

VisualState.prototype = {
    update: function(dt) {
        var newPlayersLen = this._networkState.newPlayers.length;
        if (newPlayersLen > 0) {
            for (var i = 0; i < newPlayersLen; i++) {
                var newPlayerId = this._networkState.newPlayers.shift();
                var newPlayer = this._networkState.players[newPlayerId];
                var pos = newPlayer.lastPos;
                if (newPlayer.isMe) {
                    console.log('adding visual for myself!');
                    this._serverMe = Facade.factory.sprite(pos.x, pos.y, 'test', this._group, 0xCCCCCC);
                    this._serverPlayers[newPlayerId] = this._serverMe;
                    this._clientMe = Facade.factory.sprite(pos.x, pos.y, 'test', this._group, 0x0000CC, new Phaser.Point(0.95, 0.95));
                } else {
                    console.log('adding visual for player', newPlayerId);
                    this._serverPlayers[newPlayerId] = Facade.factory.sprite(pos.x, pos.y, 'test', this._group, 0xCCCCCC);
                }
            }
        }

        // implement movement and interpolation here

        // debug server movement display:
        var players = this._networkState.players;
        for (var clientId in this._serverPlayers) {
            this._serverPlayers[clientId].x = players[clientId].lastPos.x;
            this._serverPlayers[clientId].y = players[clientId].lastPos.y;
        }

        Facade.queue.simulateStream(Date.now(), 0, this._clientMe.position, Facade.params.playerSpeedX, Facade.params.playerSpeedY);
    }
};

Object.defineProperty(VisualState.prototype, 'me', {
    get: function() {
        return this._clientMe;
    }
});

Object.defineProperty(VisualState.prototype, 'serverMe', {
    get: function() {
        return this._serverMe;
    }
});