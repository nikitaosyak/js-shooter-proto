
Connection = function (host, port, router) {
    this._host = host;
    this._port = port;
    this._router = router || new Router();

    this._socket = null;
    this._connected = false;
    this._pingTime = 0;
    console.log('connection created at %s:%i', this._host, this._port);
};
Connection.prototype.constructor = Connection;

Connection.prototype = {

    connect: function() {
        console.log('starting to connect at %s:%i', this._host, this._port);
        this._socket = new WebSocket('ws://' + this._host + ':' + this._port);
        var s = this._socket;
        var context = this;

        s.onopen = function() { context._onOpen.call(context); };
        s.onmessage = function(messageEvent) { context._onMessage.call(context, messageEvent); };
        s.onerror = function(data) { context._onError.call(context, data); };
        s.onclose = function(closeEvent) { context._onClose.call(context, closeEvent); };
    },

    checkRTT: function() {
        console.log('checking rtt..');
        this._pingTime = new Date().getTime();
        this._socket.send('ping');
    },

    pushControls: function(velocity, timeDelta) {
        // console.log('sending new velocity: ', velocity);
        var velocityDiff = {
            'id': 'velocityDiff', 
            'x': velocity.x,
            'y': velocity.y,
            'timeDelta': timeDelta
        };
        this._socket.send(JSON.stringify(velocityDiff));
    },

    _onOpen: function() {
        console.log('socket connected to ', this._host, ':', this._port);
    },

    _onMessage: function(messageEvent) {
        var rawData = messageEvent.data;
        if (rawData == 'pong') {
            var rttTime = new Date().getTime() - this._pingTime;
            this._pingTime = 0;
            console.log('rtt time is %i', rttTime);
        } else {
            var packet = JSON.parse(rawData);
            var commandType = packet['id'];
            console.log('attempting to route command id %s to router: ', commandType);
            this._router[commandType](packet);
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
        return this._pingTime > 0;
    }
});