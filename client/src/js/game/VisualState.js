
VisualState = function(game, networkState, levelModel) {
    console.log("visual state created");
    this._game = game;
    this._networkState = networkState;

    var g = game.add.graphics(levelModel.width, levelModel.height);
    g.x = 0;
    g.y = 0;
    console.log(levelModel);
    for (var bi = 0; bi < levelModel.bodies.length; bi++) {
        var b = levelModel.bodies[bi];
        if (b.colorScheme == 'bounds') {
            g.lineStyle(2, 0xCC1111, 1);
        } else {
            g.lineStyle(2, 0xCCCCCC, 1);
        }

        g.moveTo(b.vertices[0].x, b.vertices[0].y);
        for (var vi = 1; vi < b.vertices.length; vi++) {
            var v = b.vertices[vi];
            g.lineTo(v.x, v.y);
        }
        g.lineTo(b.vertices[0].x, b.vertices[0].y);
    }


    this._group = new Phaser.Group(game, game.world);
    game.world.add(this._group);

    this._visuals = {};
    this._visualMe = null;
}

VisualState.prototype.constructor = VisualState;

VisualState.prototype = {
    update: function(dt) {
        // handle player coming\going
        this._addNewPlayers();
        this._removeLeftPlayers();

        // debug update and interpolation
        var players = this._networkState.players;
        for (var clientId in this._visuals) {

            // raw snapshot movement display:
            var player = players[clientId];
            var playerVisual = this._visuals[clientId];
            playerVisual.debugView.x = player.lastPos.x;
            playerVisual.debugView.y = player.lastPos.y;

            // interpolated movement
            if (player.isMe) continue;
            player.interpolate(playerVisual.view, playerVisual.pointerPos, dt);
            playerVisual.arrow.position = playerVisual.view.position;

            // pointer display
            var r = this._calcArrowRotation(playerVisual.view, playerVisual.pointerPos);
            playerVisual.arrow.rotation = r;
        }

        // client prediction for myself:
        Facade.queue.simulateStream(Date.now(), 0, this._visualMe.view.position);
        this._visualMe.arrow.position = this._visualMe.view.position;

        var pointer = this._game.input.mousePointer;
        var r = this._calcArrowRotation(this._visualMe.view, pointer);
        this._visualMe.arrow.rotation = r;
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

    },

    _calcArrowRotation: function(p1, p2) {
        var xd = p2.x - p1.x;
        var yd = p2.y - p1.y;
        return Math.atan2(yd, xd);
    }
};

Object.defineProperty(VisualState.prototype, 'me', {
    get: function() {
        return this._visualMe;
    }
});