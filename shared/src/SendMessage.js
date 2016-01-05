function SendMessage() {}

//
// Common messages
//

SendMessage.debug = function() {
    var m = {'id': 'debug'};
    for (var k in arguments[0]) {
        m[k] = arguments[0][k];
    }
    return JSON.stringify(m);
};


//
// Server messages
//

SendMessage.welcome = function(clientId, x, y, time) {
    var m = {
        'id': 'welcome', 
        'clientId': clientId, 'startX': x, 'startY': y, 'time': time
    };
    return JSON.stringify(m);
};

SendMessage.srvTime = function(time) {
    var m = {
        'id': 'srvTime', 'time': time
    };
    return JSON.stringify(m);
};

SendMessage.position = function(clientId, x, y) {
    var m = {
        'id': 'position', 
        'clientId': clientId, 'x': x, 'y': y
    };
    return JSON.stringify(m);
};

SendMessage.positionBatch = function(stampsArray) {
    return JSON.stringify({'id': 'positionBatch', 'value': stampsArray});
};


//
// Client messages
//

SendMessage.medianRTT = function(clientId, value) {
    return JSON.stringify({'id': 'medianRTT', 'clientId': clientId, 'value': value});
};

SendMessage.velocityDiff = function(clientId, x, y, timeDelta) {
    var m = {'id': 'vd', 'cid': clientId, 'x': x, 'y': y, 'dt': timeDelta};
    return JSON.stringify(m);
};


//
// nodejs plug
//

if (typeof module !== 'undefined') {
    module.exports.SendMessage = SendMessage;
}
