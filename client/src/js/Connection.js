
Connection = function (host, port) {
    this._host = host;
    this._port = port;
    this._socket = null;
    this._connected = false;
    this._pingTime = 0;
    console.log('connection created at %s:%i', this._host, this._port);
};
Connection.prototype.constructor = Connection;

Connection.prototype = {

    connect: function() {
        console.log('starting to connect at %s:%i', this._host, this._port);
        var self = this;
        self._socket = new WebSocket('ws://' + self._host + ':' + self._port);
        var s = self._socket;

        s.onopen = function() { self._onOpen(self); };
        s.onmessage = function(messageEvent) { self._onMessage(self, messageEvent); };
        s.onerror = function(data) { self._onError(self, data); };
        s.onclose = function(closeEvent) { self._onClose(self, closeEvent); };
    },

    checkRTT: function() {
        console.log('checking rtt..');
        this._pingTime = new Date().getTime();
        this._socket.send('ping');
    },

    _onOpen: function(self) {
        console.log('socket connected to ', self._host, ':', self._port);
    },

    _onMessage: function(self, messageEvent) {
        var data = messageEvent.data;
        if (data == 'pong') {
            var rttTime = new Date().getTime() - self._pingTime;
            self._pingTime = 0;
            console.log('rtt time is %i', rttTime);
        } else {
            console.log('some data came: ' + data);
        }
    },

    _onError: function(self, data) {
        console.error('error on socket: %s', data);
    },

    _onClose: function(self, closeEvent) {
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
        return this._pingTime > 0;
    }
});