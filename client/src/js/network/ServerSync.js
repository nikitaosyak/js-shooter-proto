ServerSync = function(socket) {
    console.log('ServerSync created');
    this._socket = socket;

    this._lastPingTime = -1;
    this._calculatingMedian = false;
    this._wasMedianChecked = false;
    this._rttHistory = [];

    this._lastRtt = -1;
    this._lastSrvDelta = -1;
};

ServerSync.prototype.constructor = ServerSync;

ServerSync.prototype = {
    initialSync: function() {
        if (this._calculatingMedian || this._wasMedianChecked) return;
        this._calculatingMedian = true;
        this.ping();
    },

    ping: function() {
        this._lastPingTime = Date.now();
        this._socket.send(SendMessage.ping());
    },

    pingAck: function(packet) {
        var currentTime = Date.now();
        this._lastRtt = currentTime - this._lastPingTime;
        this._lastSrvDelta = currentTime - packet.time;
        // console.log('rtt', this._lastRtt, 'delta', this._lastSrvDelta);

        if (this._calculatingMedian) {
            this._rttHistory.push(this._lastRtt);
            if (this._rttHistory.length == Facade.params.rttMedianHistory) {
                // finish median checking
                this._calculatingMedian = false;
                this._wasMedianChecked = true;
                this._rttHistory.sort(SharedUtils.sortAcc);
                this._lastRtt = this._rttHistory[Math.floor(Facade.params.rttMedianHistory/2)];
                this._socket.send(SendMessage.medianRTT(Facade.networkState.myClientId, this._lastRtt));
                console.log('initial approx rtt:', this._lastRtt);
            } else {
                this.ping();
            }
        }
    },

    ackToServer: function() { this._socket.send(SendMessage.pong()); },

    update: function() {
        if (this._calculatingMedian) return;

        var currentTime = Date.now();
        if (currentTime - this._lastPingTime > Facade.params.rttCheckTimeout) {
            this.ping();
        }
    },
};

Object.defineProperty(ServerSync.prototype, "isReady", {
    get: function() {
        return this.rtt >= 0 && this._wasMedianChecked;
    }
});

Object.defineProperty(ServerSync.prototype, "rtt", {
    get: function() {
        return this._lastRtt;
    }
});

Object.defineProperty(ServerSync.prototype, "lag", {
    get: function() {
        return Math.round(this._lastRtt/2);
    }
});

Object.defineProperty(ServerSync.prototype, "srvDelta", {
    get: function() {
        return this._lastSrvDelta;
    }
});