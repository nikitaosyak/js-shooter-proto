
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
        var me = new Player(m.clientId, m.startX, m.startY, true);
        Facade.networkState.addMe(me);
        console.log("incoming welcome message! id obtained:", m.clientId);
    },

    srvTime: function(m) {
        Facade.srvDeltaTime = Date.now() - m.time;
        console.log("incoming srvTime", m.time, "delta:", Facade.srvDeltaTime);
    },

    position: function(m) {
        Facade.networkState.setPlayerPos(m.clientId, m.x, m.y);
    },

    positionBatch: function(m) {
        // console.log('incoming pos batch: ', m);
        for (var i = 0; i < m.value.length; i++) {
            var piece = m.value[i];
            Facade.networkState.addPlayerPos(piece.clientId, piece.x, piece.y, piece.time);
        }
    }
}