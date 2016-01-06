PlayerVisual = function(x, y, group, isMe) {
    this.isMe = isMe;
    this.group = group;
    this.pointerPos = {x:-1, y:-1};

    this.debugView = Facade.factory.sprite(
        x, y, 
        'player_sprite', group, 
        isMe ? 0xCCCCCC : 0xAAAAAA, 
        undefined, undefined, 
        Facade.params.serverStateVisible ? 0.2 : 0
    );
    
    var color = isMe ? 0x0000CC : 0xCC0000;
    this.view = Facade.factory.sprite(
        x, y, 'player_sprite', group, color, new Phaser.Point(0.95, 0.95)
    );

    this.arrow = Facade.factory.sprite(
        x, y, 'player_dir_arrow', group, color,
        undefined,
        new Phaser.Point(-2, 0.5)
    );
}

PlayerVisual.prototype.constructor = PlayerVisual;

PlayerVisual.prototype = {}