PlayerVisual = function(x, y, group, isMe) {
    this.isMe = isMe;
    this.group = group;

    var dColor = isMe ? 0xCCCCCC : 0xAAAAAA;
    var dAlpha = Facade.params.serverStateVisible ? 0.2 : 0;
    this.debugView = Facade.factory.sprite(
        x, y, 'player_sprite', group, dColor, undefined, undefined, dAlpha
        );
    var color = isMe ? 0x0000CC : 0xCC0000;
    this.view = Facade.factory.sprite(
        x, y, 'player_sprite', group, color, new Phaser.Point(0.95, 0.95)
        );
}

PlayerVisual.prototype.constructor = PlayerVisual;

PlayerVisual.prototype = {}