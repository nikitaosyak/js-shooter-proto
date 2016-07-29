/*jshint esversion: 6*/
export class ClientRouter extends RouterBase {

    constructor() {
        super();
        this.p_ack = Facade.connection.sync.pingAck().bind(Facade.connection.sync);
    }

    debug(message) {
        console.log("incoming debug message: ");
        for (var k in message) {
            console.log("%s: %s", k, message[k]);
        }
    }

    welcome(m) {
        console.log(m);
        if (m.me) {
            Facade.myId = m.clientId;
            var me = new Player(m.clientId, m.startX, m.startY, m.name, true);
            Facade.networkState.addMe(me, {'pos': {x: m.startX, y: m.startY}, 'pointer_pos': {x: 0, y: 0}});
        } else {
            var other = new Player(m.clientId, m.startX, m.startY, m.name, false);
            Facade.networkState.addPlayer(other, {'pos': {x: m.startX, y: m.startY}, 'pointer_pos': {x: 0, y: 0}});
        }
        Facade.simulation.addClient(m.clientId, m.startX, m.startY);
    }

    srvTime(m) {
        Facade.srvDeltaTime = Date.now() - m.time;
        // console.log("incoming srvTime", m.time, "delta:", Facade.srvDeltaTime);
    }

    changeName(m) {
        if (Facade.networkState.players[m.cid]) {
            Facade.networkState.players[m.cid].name = m.name;
        }
        if (Facade.visualState._visuals[m.cid]) {
            Facade.visualState._visuals[m.cid].setName(m.name);
        }
    }

    positionBatch(m) {
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
    }

    shotAck(m) {
        if (m.cid == Facade.myId) return;

        for (var i = 0; i < m.value.length; ++i) {
            var data = m.value[i];
            var shooterPosition = Facade.networkState.interpolator[data.id].pos.lerpValue;
            var ray = SharedUtils.Point.truncateRay(shooterPosition, data.to, Facade.params.playerRadius + 1);
            if (data.id == Facade.myId) continue;
            Facade.visualState.drawRay(ray.start, ray.end);
        }
    }

    playerDeath(m) {
        for (var i = 0; i < m.victims.length; i++) {
            var deadId = m.victims[i];
            if (Facade.myId == deadId) {
                console.log('I was killed by ', m.killer);
                Facade.networkState.removeMe();
                Facade.input.reset();
            } else {
                console.log('%d was killed by %d', deadId, m.killer);
                if (deadId in Facade.networkState.players) {
                    Facade.networkState.removePlayerById(deadId);
                }
            }
            Facade.simulation.deleteClient(deadId);
        }
    }

    clientLeave(m) {
        for (var i = 0; i < m.value.length; i++) {
            var leftClientId = m.value[i];
            if (Facade.myId === leftClientId) {
                throw "I cannot leave, i am here, right?";
            } else {
                console.log('client %d left the game', leftClientId);
                // Facade.networkState.removePlayerById(deadId);
                if (leftClientId in Facade.networkState.players) {
                    Facade.networkState.removePlayerById(leftClientId);
                    Facade.simulation.deleteClient(leftClientId);
                } else {
                    // do nothing, i guess
                }
            }
        }
    }
}