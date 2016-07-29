/*jshint esversion: 6*/
export class RPC {
    /** @param socket {WebSocket} */
    constructor(socket) {
        this._s = socket;
    }

    changeName(name) {
        this._s.send(JSON.stringify({id: "changeName", cid: Facade.myId, name: name}));
    }

    velocity(v, td) {
        var m = {'id': 'vd', 'cid': Facade.myId, 'x': v.x, 'y': v.y, 'dt': td};
        this._s.send(JSON.stringify(m));
    }

    pointer(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        this._s.send(JSON.stringify({id:"pointer", cid:Facade.myId, x:x, y:y}));
    }

    requestShot(lerpTime, moveTimeOffset, to) {
        this._s.send(JSON.stringify({id: 'requestShot', lerp: lerpTime, time: moveTimeOffset, to: to}));
    }

    requestSpawn() {
        this._s.send(JSON.stringify({id: 'requestSpawn', 'cid': Facade.myId}));
    }
}