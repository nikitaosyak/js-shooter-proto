PlayerVisual = function(x, y, group, isMe) {
    this.isMe = isMe;
    this.group = group;
    this.pointerPos = {x:-1, y:-1};

    this.debugView = Facade.factory.sprite(
        x, y, 
        'player_sprite', group, 
        isMe ? 0xCCCCCC : 0xAAAAAA, 
        new Phaser.Point(0.5, 0.5), undefined, 
        Facade.params.serverStateVisible ? 0.3 : 0
    );
    
    var color = isMe ? 0x0000CC : 0xCC0000;
    this.view = Facade.factory.sprite(
        x, y, 'player_sprite', group, color, new Phaser.Point(0.5, 0.5), undefined, 0.5
    );

    this.arrow = Facade.factory.sprite(
        x, y, 'player_dir_arrow', group, color,
        undefined,
        new Phaser.Point(-1, 0.5), 0.8
    );
};

PlayerVisual.prototype.constructor = PlayerVisual;

PlayerVisual.prototype = {
    purge: function() {
        this.group.remove(this.debugView);
        this.group.remove(this.view);
        this.group.remove(this.arrow);
        this.group = null;

        this.debugView = null;
        this.view = null;
        this.arrow = null;
    },
};