
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
        Facade.networkState.addPlayerPos(m.clientId, m.x, m.y, m.time);
    },

    positionBatch: function(m) {
        // console.log('incoming pos batch: ', m);
        for (var i = 0; i < m.value.length; i++) {
            var piece = m.value[i];
            Facade.networkState.addPlayerPos(piece.clientId, piece.x, piece.y, piece.time);
        }
    }
}