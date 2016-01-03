
Router = function(state) {
    console.log("router created");
    this._state = state;
}

Router.prototype.constructor = Router;

Router.prototype = {
    debug: function(message) {
        console.log("incoming debug message: ");
        for (k in message) {
            console.log("%s: %s", k, message[k]);
        }
    },

    welcome: function(message) {
        console.log("incoming welcome message! id obtained:", message.clientId);
        var me = new Player(message.clientId, message.startX, message.startY, true);
        this._state.addMe(me);
    },

    position: function(message) {
        var targetPlayer = this._state.players[messsage.clientId];
        targetPlayer.updateBackendPos(message.x, message.y, message.time);
    }
}