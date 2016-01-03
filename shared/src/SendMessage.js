
function SendMessage() {

}

SendMessage.debug = function() {
    var m = {'id': 'debug'};
    for (var k in arguments[0]) {
        m[k] = arguments[0][k];
    }
    return JSON.stringify(m);
};

SendMessage.velocityDiff = function(x, y, timeDelta) {
    var m = {'id': 'velocityDiff', 'x': x, 'y': y, 'timeDelta': timeDelta};
    return JSON.stringify(m);
};

SendMessage.medianRTT = function(value) {
    return JSON.stringify({'id': 'medianRTT', 'value': value});
};

if (typeof module !== 'undefined') {
    module.exports.SendMessage = SendMessage;
}
