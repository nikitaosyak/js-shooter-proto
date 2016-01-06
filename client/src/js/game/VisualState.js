
VisualState = function(game, networkState) {
    console.log("visual state created");
    this._game = game;
    this._networkState = networkState;
    this._group = new Phaser.Group(game, game.world);
    game.world.add(this._group);

    this._visuals = {};
    this._visualMe = null;
}

VisualState.prototype.constructor = VisualState;

VisualState.prototype = {
    update: function(dt) {
        // float xDiff = p2.X - p1.X; 
        // float yDiff = p2.Y - p1.Y; 
        // return Math.Atan2(yDiff, xDiff) * (180 / Math.PI);
        this._addNewPlayers();
        this._removeLeftPlayers();

        var players = this._networkState.players;
        for (var clientId in this._visuals) {

            // debug server movement display:
            var player = players[clientId];
            var playerVisual = this._visuals[clientId];
            playerVisual.debugView.x = player.lastPos.x;
            playerVisual.debugView.y = player.lastPos.y;

            // visual interpolation of other players:
            if (player.isMe) continue;
            player.interpolate(playerVisual.view, dt);
            playerVisual.arrow.position = playerVisual.view.position;
        }

        // client prediction for myself:
        var sX = Facade.params.playerSpeedX;
        var sY = Facade.params.playerSpeedY;
        Facade.queue.simulateStream(Date.now(), 0, this._visualMe.view.position, sX, sY);
        this._visualMe.arrow.position = this._visualMe.view.position;
    },

    _addNewPlayers: function() {
        var newPlayersLen = this._networkState.newPlayers.length;
        if (newPlayersLen > 0) {
            for (var i = 0; i < newPlayersLen; i++) {
                var newPlayerId = this._networkState.newPlayers.shift();
                var newPlayer = this._networkState.players[newPlayerId];
                var pos = newPlayer.lastPos;
                console.log('adding visual player (isMe:', newPlayer.isMe);
                this._visuals[newPlayerId] = new PlayerVisual(pos.x, pos.y, this._group, newPlayer.isMe);
                if (newPlayer.isMe) {
                    this._visualMe = this._visuals[newPlayerId];
                }
            }
        }
    },

    _removeLeftPlayers: function() {

    }
};

Object.defineProperty(VisualState.prototype, 'me', {
    get: function() {
        return this._visualMe;
    }
});