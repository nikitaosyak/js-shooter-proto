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

SendMessage.pointer = function(clientId, x, y) {
    return JSON.stringify({id:"pointer", cid:clientId, x:x, y:y});
};

SendMessage.ping = function() {
    return JSON.stringify({id:"p"});
};

SendMessage.pong = function(srvTime) {
    if (srvTime !== 'undefined') {
        return JSON.stringify({id:"p_ack", time:srvTime});    
    }
    return JSON.stringify({id:"p_ack"});
};

SendMessage.rewrap = function(message) { return JSON.stringify(message); };

//
// Server messages
//

SendMessage.welcome = function(clientId, x, y, name, isMe) {
    if (isMe === 'undefined') isMe = false;
    var m = {
        'id': 'welcome', 
        'clientId': clientId, 'startX': x, 'startY': y, 'name': name, 'me': isMe
    };
    return JSON.stringify(m);
};

SendMessage.srvTime = function(time) {
    var m = {
        'id': 'srvTime', 'time': time
    };
    return JSON.stringify(m);
};

SendMessage.positionBatch = function(stampsArray) {
    return JSON.stringify({'id': 'positionBatch', 'value': stampsArray});
};

SendMessage.playerDeath = function(clients) {
    return JSON.stringify({'id': 'playerDeath', 'value': clients});
};

SendMessage.shotAck = function(clientId, to, hits) {
    return JSON.stringify({id: 'shotAck', cid: clientId, to: to, hits: hits});
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

SendMessage.requestShot = function(lerp, from, to) {
    return JSON.stringify({id: 'requestShot', lerp: lerp, from: from, to: to});
};


//
// nodejs plug
//

if (typeof module !== 'undefined') {
    module.exports.SendMessage = SendMessage;
}
