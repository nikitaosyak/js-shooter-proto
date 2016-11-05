/*jshint esversion: 6*/
export class ServerSync {
    constructor(socket) {
        console.log('ServerSync created');
        
        this._s = socket;
        this._lastPingTime = Number.NaN;
        
        this._rttHistory = [];
        this._rttMedianHistory = [];
        
        this._srvDelta = Number.NaN;
        
        this._cachedPingMessage = JSON.stringify({ id: "p" });
    }

    get rtt() { return this._rttMedianHistory[Math.floor(this._rttMedianHistory.length/2)]; }
    get lag() { return this.rtt/2; }
    get srvDelta() { return this._srvDelta; }

    pingAck(packet) {
        console.log(packet)
        let t = Date.now();
        let lastRtt = t - this._lastPingTime;
        this._srvDelta = t - packet.time;
        console.log(typeof this, ': got server pong, rtt:', lastRtt, '; srvDelta: ', this._srvDelta);

        this._lastPingTime = Number.NaN;
        this._rttHistory.unshift(lastRtt);
        if (this._rttHistory.length > 21) this._rttHistory.pop();

        this._rttMedianHistory = this._rttHistory.slice();
        this._rttMedianHistory.sort(SharedUtils.sortAcc);

        setTimeout(this._ping.bind(this), 1000);
    }

    _ping() {
        console.log(typeof this, ': performing ping');
        this._lastPingTime = Date.now();
        this._s.send(this._cachedPingMessage);
    }
}