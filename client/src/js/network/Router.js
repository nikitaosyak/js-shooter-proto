
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
        if (m.me) {
            var me = new Player(m.clientId, m.startX, m.startY, m.name, true);
            Facade.networkState.addMe(me);
            Facade.queue.addClient(0, m.startX, m.startY);
        } else {
            var other = new Player(m.clientId, m.startX, m.startY, m.name, false);
            Facade.networkState.addPlayer(other);
        }
    },

    srvTime: function(m) {
        Facade.srvDeltaTime = Date.now() - m.time;
        console.log("incoming srvTime", m.time, "delta:", Facade.srvDeltaTime);
    },

    positionBatch: function(m) {
        // console.log('incoming pos batch: ', m);
        var ns = Facade.networkState;
        for (var i = 0; i < m.value.length; i++) {
            var piece = m.value[i];
            if ('x' in piece) {
                ns.addPlayerPos(piece.clientId, piece.x, piece.y, piece.time);
            }
            if ('px' in piece) {
                ns.setPointerLocation(piece.clientId, piece.px, piece.py, piece.time);
            }
        }
    },

    playerDeath: function(m) {
        Facade.networkState.removePlayerById(m.value);
    }
}