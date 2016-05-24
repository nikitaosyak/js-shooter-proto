
VisualState = function(game, networkState, levelModel) {
    console.log("visual state created");
    this._game = game;
    this._networkState = networkState;

    var g = game.add.graphics(levelModel.width, levelModel.height);
    g.x = 0;
    g.y = 0;
    // console.log(levelModel);
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
};

VisualState.prototype.constructor = VisualState;

VisualState.prototype = {
    drawRay: function(start, end) {
        var g = this._game.add.graphics(start.x, start.y);
        g.lineStyle(2, 0xCC0000);
        g.moveTo(0, 0);
        g.lineTo(end.x - start.x, end.y - start.y);

        game.add.tween(g).to({alpha: 0}, 1000, "Linear", true).onComplete.addOnce(function(obj, tween) {
            this._game.world.remove(obj);
            this._game.world.remove(tween);
        }, this);
    },

    update: function(dt) {
        // handle player coming\going
        this._addNewPlayers();
        this._removeLeftPlayers();

        // debug update and interpolation
        var players = this._networkState.players;
        var r;
        var lerp = this._networkState.interpolator;
        for (var clientId in this._visuals) {

            // debug snapshot movement display:
            var playerVisual = this._visuals[clientId];
            playerVisual.updateDebugPos(lerp[clientId].pos.rawValue);

            // interpolate movement and arrow rotation
            if (players[clientId].isMe) continue;
            playerVisual.updatePos(lerp[clientId].pos.lerpValue);
            playerVisual.updateArrowAngle(lerp[clientId].pointer_pos.lerpValue);
        }

        if (this._visualMe === null) return;

        // client prediction for myself:
        var state = {x: this._visualMe.view.position.x, y: this._visualMe.view.position.y};
        var newState = Facade.simulation.simulateClientStream(Date.now(), Facade.myId, state);
        if (newState.change) {
            this._visualMe.updatePos(newState.state);
        }
        var pointerState = {
            x: this._game.input.mousePointer.worldX,
            y: this._game.input.mousePointer.worldY
        };
        this._visualMe.updateArrowAngle(pointerState);
    },

    _addNewPlayers: function() {
        var newPlayersLen = this._networkState.newPlayers.length;
        if (newPlayersLen > 0) {
            for (var i = 0; i < newPlayersLen; i++) {
                var newPlayerId = this._networkState.newPlayers[i];
                var newPlayer = this._networkState.players[newPlayerId];
                console.log(newPlayer);
                var pos = this._networkState.interpolator[newPlayerId].pos.rawValue;
                // console.log('adding visual player (isMe:', newPlayer.isMe);
                this._visuals[newPlayerId] = new PlayerVisual(newPlayerId, pos.x, pos.y, this._group, newPlayer.isMe, newPlayer.name);
                if (newPlayer.isMe) {
                    this._visualMe = this._visuals[newPlayerId];
                    this._game.camera.follow(this._visualMe.view);
                }
            }
            this._networkState.newPlayers = [];
        }
    },

    _removeLeftPlayers: function() {
        var leftPlayersLen = this._networkState.removedPlayers.length;
        if (leftPlayersLen > 0) {
            for (var i = 0; i < leftPlayersLen; i++) {
                var leftPlayerId = this._networkState.removedPlayers[i];
                if (leftPlayerId == Facade.myId) {
                    console.log('removing self', leftPlayerId);
                    this._visualMe = null;
                    this._game.camera.unfollow();
                } else {
                    console.log('removing visual player', leftPlayerId);
                }
                var leftPlayer = this._visuals[leftPlayerId];
                delete this._visuals[leftPlayerId];
                if (leftPlayer) {
                    leftPlayer.purge();
                }
            }
            this._networkState.removedPlayers = [];
        }
    }
};

Object.defineProperty(VisualState.prototype, 'me', {
    get: function() {
        return this._visualMe;
    }
});