PlayerVisual = function(id, x, y, group, isMe, name) {
    this.id = id;
    this.isMe = isMe;
    this.group = group;
    this.pointerPos = {x:-1, y:-1};

    this.debugView = Facade.factory.sprite(
        x, y, 
        'player_sprite', group, 
        isMe ? 0xCCCCCC : 0xAAAAAA, 
        new Phaser.Point(0.5, 0.5), undefined, 
        Facade.params.serverStateVisible ? 0.08 : 0
    );
    
    var color = isMe ? 0x0000CC : 0xCC0000;
    this.view = Facade.factory.sprite(
        x, y, 'player_sprite', group, color, new Phaser.Point(0.5, 0.5), undefined, 0.5
    );

    this.textView = new Phaser.Text(Facade.factory._game, x, y, name, {font: "10x Arial", fill: "#CCCCCC", boundsAlignH: "center", boundsAlignV: "middle"});
    this.textView.anchor.x = 0.5;
    this.textView.anchor.y = 0.5;
    group.add(this.textView);
    // this.textView.setTextBounds(0, 0, 50, 50);

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
        this.group.remove(this.textView);
        this.group = null;

        this.debugView = null;
        this.view = null;
        this.arrow = null;
    },

    updateDebugPos: function(newPos) {
        this.debugView.position.x = newPos.x;
        this.debugView.position.y = newPos.y;
    },

    updatePos: function(newPos) {
        var prevPos = {x: this.view.position.x, y: this.view.position.y};
        this.view.position.x = newPos.x;
        this.view.position.y = newPos.y;
        this.textView.position.x = newPos.x;
        this.textView.position.y = newPos.y;
        this.arrow.position = this.view.position;

        if (this.isMe) return;

        Facade.simulation.physics.setActorBodyPosition(
            this.id,
            newPos.x,
            newPos.y
        );
    },

    updateArrowAngle: function(newPointerPos) {
        this.pointerPos = newPointerPos;
        var xd = newPointerPos.x - this.view.position.x;
        var yd = newPointerPos.y - this.view.position.y;
        this.arrow.rotation = Math.atan2(yd, xd);
    },

    setName: function(name) {
        console.log("new name " + name);
        this.textView.text = name;
    }
};