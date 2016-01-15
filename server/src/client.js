
var _clientIdCounter = 0;
var _READY_STATE_STR = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];

Client = function(socket, pos) {
    this._socket = socket;
    this._id = _clientIdCounter++;
    this._name = "client" + this._id;
    this._approxLag = 0;
    this.pos = pos;
    this.lastSentPointer = {x:-1, y:-1};
    this.pointer = {x:-1, y:-1};
};
Client.prototype.constructor = Client;

Client.prototype =  {

    send: function (data) {
        if (!this._socket || this._socket.readyState !== 1) {
            return;
        }
        this._socket.send(data, function ack(error) {
            if (error === undefined) return;
            console.log(this.toString() + "::SEND_ERROR::" + error);
        });
    },

    setMedianRTT: function(value) {
        this._approxLag = Math.floor(value/2);
    },

    purge: function () {
        this._socket = null;
        this._id = -1;
    },

    toString: function () {
        if (this._socket) {
            var socketState = _READY_STATE_STR[this._socket.readyState];
            return '{[' + this._id + ":" + this._name + "]; sock [" + socketState + "]}";
        } else {
            return '{[' + this._id + ":" + this._name + "]; sock [DEAD]}";
        }    
    }
};

Object.defineProperty(Client.prototype, "id", {
    get: function() {
        return this._id;
    }
});

Object.defineProperty(Client.prototype, "name", {
    get: function() {
        return this._name;
    }
});

Object.defineProperty(Client.prototype, "lag", {
    get: function() {
        return this._approxLag;
    }
});

module.exports = Client;