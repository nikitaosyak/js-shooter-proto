
Router = function() {
    console.log("router created");
}

Router.prototype.constructor = Router;

Router.prototype = {
    debug: function(message) {
        console.log("incoming debug message: ");
        for (k in message) {
            console.log("%s: %s", k, message[k]);
        }
    },

    welcome: function(m) {
        // console.log("incoming welcome message! id obtained:", m.clientId);
        var me = new Player(m.clientId, m.startX, m.startY, m.time, true);
        Facade.networkState.addMe(me);
    },

    position: function(m) {
        // var targetPlayer = this._state.players[messsage.clientId];
        // targetPlayer.updateBackendPos(message.x, message.y, message.time);
        Facade.networkState.addPlayerPos(m.clientId, m.x, m.y, m.time);
    }
}