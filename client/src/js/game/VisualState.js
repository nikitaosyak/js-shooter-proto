
VisualState = function(game) {
    console.log("visual state created");
    this._game = game;
    this._group = new Phaser.Group(game, game.world);
    game.world.add(this._group);

    this._serverMe = Facade.factory.sprite(-1000, -1000, 'test', this._group, 0xCCCCCC);
    this._clientMe = Facade.factory.sprite(-1000, -1000, 'test', this._group, 0x0000CC, new Phaser.Point(0.95, 0.95));
}

VisualState.prototype.constructor = VisualState;

VisualState.prototype = {

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