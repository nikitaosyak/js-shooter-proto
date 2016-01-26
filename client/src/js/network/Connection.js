
Connection = function (host, port, router) {
    this._host = host;
    this._port = port;
    this._router = router || new Router();

    this._socket = null;
    this._sync = null;
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

    calculateMedian: function() { this._sync.initialSync(); },

    sendPong: function() {
        this._socket.send(SendMessage.pong());
    },

    sendVelocity: function(v, td) {
        var m = SendMessage.velocityDiff(Facade.networkState.myClientId, v.x, v.y, td);
        this._socket.send(m);
    },

    sendPointer: function(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        this._socket.send(SendMessage.pointer(Facade.networkState.myClientId, x, y));
    },

    sendShot: function(lerpTime, moveTimeOffset, to) {
        this._socket.send(SendMessage.requestShot(lerpTime, moveTimeOffset, to));
    },

    _onOpen: function() {
        console.log('socket connected to ', this._host, ':', this._port);
        this._sync = new ServerSync(this._socket);
    },

    _onMessage: function(messageEvent) {
        var rawData = messageEvent.data;
        var command = JSON.parse(rawData);
        // console.log('attempting to route command [%s] to router: ', command.id.toUpperCase());
        if (command.id in this._router) {
            this._router[command.id](command);
        } else {
            console.log('router have no command', command.id.toUpperCase());
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
        return this._socket !== null && this._socket.readyState == 1 && this._sync.isReady;
    }
});

Object.defineProperty(Connection.prototype, "sync", {
    get: function() {
        return this._sync;
    }
});