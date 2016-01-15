var SendMessage = require('./shared.gen').SendMessage;
var GameParams = require('./shared.gen').GameParams;
var SharedUtils = require('./shared.gen').SharedUtils;

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

    this._sentPingTime = -1;
    this._rttHistory = [];
};
Client.prototype.constructor = Client;

Client.prototype =  {

    send: function (data) {
        if (!this._socketReady) return;
        this._socket.send(data, function ack(error) {
            if (error === undefined) return;
            console.log(this.toString() + "::SEND_ERROR::" + error);
        });
    },

    ping: function(currentTime) {
        if (!this._socketReady) return;
        this._sentPingTime = currentTime;
        this._socket.send(SendMessage.ping());
    },

    ackPong: function(currentTime) {
        if (this._sentPingTime === -1) {
            console.error("wrong time");
            return;
        }
        var rtt = currentTime - this._sentPingTime;
        this._rttHistory.push(rtt);
        if (this._rttHistory.length > GameParams.rttMedianHistory) {
            this._rttHistory.shift();
            var sortedHistory = this._rttHistory.concat().sort(SharedUtils.sortAcc);
            var medianIdx = Math.floor(GameParams.rttMedianHistory/2);
            this._approxLag = Math.round((sortedHistory[medianIdx] + GameParams.additionalVirtualLagMedian)/2);
            // console.log(this.lag, this._rttHistory, sortedHistory);
        }
        this._sentPingTime = -1;
    },

    setMedianRTT: function(value) {
        this._approxLag = Math.round(value/2);
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

Object.defineProperty(Client.prototype, "_socketReady", {
    get: function() {
        return this._socket && this._socket.readyState === 1;
    }
});

module.exports = Client;