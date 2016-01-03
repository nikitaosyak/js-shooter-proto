
var _clientIdCounter = 0;
var _READY_STATE_STR = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];

Client = function(socket) {
    this._socket = socket;
    this._id = _clientIdCounter++;
};
Client.prototype.constructor = Client;

Client.prototype =  {

    send: function (data) {
        if (!this._socket) {
            console.log(this.toString());
            return;
        }
        this._socket.send(data, function ack(error) {
            if (error === undefined) return;
            console.log(this.toString() + "::SEND_ERROR::" + error);
        });
    },

    purge: function () {
        this._socket = null;
        this._id = -1;
    },

    toString: function () {
        if (this._socket) {
            var socketState = _READY_STATE_STR[this._socket.readyState];
            return '{client [' + this._id + "]; sock [" + socketState + "]}";
        } else {
            return '{client [' + this._id + "]; sock [DEAD]}";
        }    
    }
};

Object.defineProperty(Client.prototype, "id", {
    get: function() {
        return this._id;
    }
});

module.exports = Client;