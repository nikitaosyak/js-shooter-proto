
Connection = function (host, port, router) {
    this._host = host;
    this._port = port;
    this._router = router || new Router();

    this._socket = null;
    this._connected = false;
    this._pingTime = 0;
    this._calculatingMedian = false;
    this._rttHistory = [];
    // console.log('connection created at %s:%i', this._host, this._port);
};
Connection.prototype.constructor = Connection;

Connection.prototype = {

    connect: function(onConnectionEstableashed) {
        // console.log('starting to connect at %s:%i', this._host, this._port);
        this._socket = new WebSocket('ws://' + this._host + ':' + this._port);
        var s = this._socket;
        var context = this;

        s.onopen = function() { 
            context._onOpen.call(context); 
            onConnectionEstableashed();
        };
        s.onmessage = function(messageEvent) { context._onMessage.call(context, messageEvent); };
        s.onerror = function(data) { context._onError.call(context, data); };
        s.onclose = function(closeEvent) { context._onClose.call(context, closeEvent); };
    },

    checkRTT: function() {
        // console.log('checking rtt..');
        this._pingTime = new Date().getTime();
        this._socket.send('ping');
    },

    calculateMedian: function() {
        if (this._calculatingMedian) return;
        // console.log('begin median calculation');
        this._calculatingMedian = true;
        this.checkRTT();
    },

    sendVelocity: function(v, td) {
        var m = SendMessage.velocityDiff(Facade.networkState.myClientId, v.x, v.y, td);
        this._socket.send(m);
    },

    sendPointer: function(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        this._socket.send(SendMessage.pointer(Facade.networkState.myClientId, x, y))
    },

    _onOpen: function() {
        console.log('socket connected to ', this._host, ':', this._port);
    },

    _onMessage: function(messageEvent) {
        var rawData = messageEvent.data;
        if (rawData == 'pong') {
            var rttTime = new Date().getTime() - this._pingTime;
            this._pingTime = 0;
            if (this._calculatingMedian) {
                this._rttHistory.push(rttTime);
                if (this._rttHistory.length == 11) {
                    this._calculatingMedian = false;
                    this._rttHistory = this._rttHistory.sort(SharedUtils.sortAcc);
                    this._socket.send(SendMessage.medianRTT(Facade.networkState.myClientId, this._rttHistory[5]));
                    Facade.approxLag = Math.round(this.RTTMedian/2);
                    console.log('approxLag:', Facade.approxLag);
                    // console.log('median check complete. history is:', this._rttHistory, 'median is:', this.RTTMedian);
                } else {
                    this.checkRTT();
                }
            } else {
                console.log('rtt time is %i', rttTime);
            }
        } else {
            var packet = JSON.parse(rawData);
            // console.log('attempting to route command [%s] to router: ', packet.id.toUpperCase());
            if (packet.id in this._router) {
                this._router[packet.id](packet);
            } else {
                console.log('router have no command', packet.id.toUpperCase());
            }
        }
    },

    _onError: function(data) {
        console.error('error on socket: %s', data);
    },

    _onClose: function(closeEvent) {
        console.log('socket closed: %s', closeEvent);
    }
};

Object.defineProperty(Connection.prototype, "isReady", {
    get: function() {
        return this._socket != null && this._socket.readyState == 1;
    }
});

Object.defineProperty(Connection.prototype, "isCheckingRTT", {
    get: function() {
        return this._pingTime > 0 || this._calculatingMedian;
    }
});

Object.defineProperty(Connection.prototype, "isCalculatingMedian", {
    get: function() {
        return this._calculatingMedian;
    }
});

Object.defineProperty(Connection.prototype, "RTTMedian", {
    get: function() {
        if (this._rttHistory.lenght == 0) return -1;
        return this._rttHistory[5];
    }
});