
Router = function() {
    console.log("router created");
};

Router.prototype.constructor = Router;

Router.prototype = {
    debug: function(message) {
        console.log("incoming debug message: ");
        for (var k in message) {
            console.log("%s: %s", k, message[k]);
        }
    },

    p: function(message) {
        Facade.connection.sync.ackToServer();
    },

    p_ack: function(message) {
        Facade.connection.sync.pingAck(message);
    },

    welcome: function(m) {
        if (m.me) {
            Facade.myId = m.clientId;
            var me = new Player(m.clientId, m.startX, m.startY, m.name, true);
            Facade.networkState.addMe(me, {'pos': {x: m.startX, y: m.startY}, 'pointer_pos': {x: 0, y: 0}});
        } else {
            var other = new Player(m.clientId, m.startX, m.startY, m.name, false);
            Facade.networkState.addPlayer(other, {'pos': {x: m.startX, y: m.startY}, 'pointer_pos': {x: 0, y: 0}});
        }
        Facade.simulation.addClient(m.clientId, m.startX, m.startY);
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

    shotAck: function(m) {
        if (m.cid == Facade.myId) return;

        for (var i = 0; i < m.value.length; ++i) {
            var data = m.value[i];
            var shooterPosition = Facade.networkState.interpolator[data.id].pos.lerpValue;
            var ray = SharedUtils.truncateRay(shooterPosition, data.to, Facade.params.playerRadius + 1);
            if (data.id == Facade.myId) continue;
            Facade.visualState.drawRay(ray.start, ray.end);    
        }
    },

    playerDeath: function(m) {
        for (var i = 0; i < m.victims.length; i++) {
            var deadId = m.victims[i];
            if (Facade.myId == deadId) {
                console.log('I was killed by ', m.killer);
                Facade.networkState.removeMe();
                Facade.input.reset();
            } else {
                console.log('%d was killed by %d', deadId, m.killer);
                Facade.networkState.removePlayerById(deadId);
            }
        }
    }
};