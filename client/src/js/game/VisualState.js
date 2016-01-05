
VisualState = function(game, networkState) {
    console.log("visual state created");
    this._game = game;
    this._networkState = networkState;
    this._group = new Phaser.Group(game, game.world);
    game.world.add(this._group);

    this._serverMe = null;
    this._clientMe = null;
    this._serverPlayers = {};
    this._interpolatedPlayers = {};
}

VisualState.prototype.constructor = VisualState;

VisualState.prototype = {
    update: function(dt) {
        function doDebugSprite(x, y, group) {
            
        }
        function doClientSprite(x, y, group) {
            var s = doDebugSprite(x, y, group);
            s.tint = 0x0000CC;
            s.scale = new Phaser.Point(0.95, 0.95);
            return s;
        }

        var newPlayersLen = this._networkState.newPlayers.length;
        if (newPlayersLen > 0) {
            for (var i = 0; i < newPlayersLen; i++) {
                var newPlayerId = this._networkState.newPlayers.shift();
                var newPlayer = this._networkState.players[newPlayerId];
                var pos = newPlayer.lastPos;
                if (newPlayer.isMe) {
                    console.log('adding visual for myself!');
                    this._serverMe = this._doDebugSprite(pos.x, pos.y, true);
                    this._serverPlayers[newPlayerId] = this._serverMe;
                    this._clientMe = this._doClientSprite(pos.x, pos.y, true);
                } else {
                    console.log('adding visual for player', newPlayerId);
                    this._serverPlayers[newPlayerId] = this._doDebugSprite(pos.x, pos.y, false);
                    this._interpolatedPlayers[newPlayerId] = this._doClientSprite(pos.x, pos.y, false);
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

        // interpolation will be here:
        for (var clientId in this._interpolatedPlayers) {
            var interpolatedPlayer = this._interpolatedPlayers[clientId];
            players[clientId].interpolate(interpolatedPlayer, dt);
            // .x = players[clientId].lastPos.x;
            // this._interpolatedPlayers[clientId].y = players[clientId].lastPos.y;
        }

        var sX = Facade.params.playerSpeedX;
        var sY = Facade.params.playerSpeedY;
        Facade.queue.simulateStream(Date.now(), 0, this._clientMe.position, sX, sY);
    },

    _doDebugSprite: function(x, y, isMe) {
        var color = isMe ? 0xCCCCCC : 0xAAAAAA;
        var alpha = Facade.params.serverStateVisible ? 0.2 : 0;
        return Facade.factory.sprite(x, y, 'test', this._group, color, undefined, undefined, alpha);
    },

    _doClientSprite: function(x, y, isMe) {
        var color = isMe ? 0x0000CC : 0xCC0000;
        return Facade.factory.sprite(x, y, 'test', this._group, color, new Phaser.Point(0.95, 0.95));  
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