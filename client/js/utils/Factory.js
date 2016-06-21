
Factory = function(game) {
    this._game = game;
};
Factory.prototype.constructor = Factory;

Factory.prototype = {
    sprite: function(x, y, visual, parent, tint, scale, pivot, alpha) {
        tint = tint || 0xFFFFFF;
        if (typeof scale === 'undefined') {
            scale = new Phaser.Point(1, 1);  
        } else {
            scale = new Phaser.Point(scale.x, scale.y);
        }
        if (typeof alpha === 'undefined') 
            alpha = 1;

        var image = this._game.cache.getImage(visual);
        if (pivot) {
            pivot = new Phaser.Point(pivot.x * image.width, pivot.y * image.height);
        } else {
            pivot = new Phaser.Point(0.5 * image.width, 0.5 * image.height);
        }

        var s = new Phaser.Sprite(this._game, x, y, visual);
        s.tint = tint;
        s.scale = scale;
        s.pivot = pivot;
        s.alpha = alpha;
        if (parent) {
            parent.add(s);
        }
        return s;
    }
};
