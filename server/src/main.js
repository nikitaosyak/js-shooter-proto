var ws = require('ws');
var time_util = require('./time_util.js');
var Client = require('./client.js');
var SendMessage = require('./shared.gen.js').SendMessage;

var spawnPositions = [
    {'x': 100, 'y': 100}, 
    {'x': 400, 'y': 100}, 
    {'x': 100, 'y': 400}, 
    {'x': 400, 'y': 400}
];
var currentSpawnPos = 0;

var clients = {};

ws.createServer({host: '0.0.0.0', port:3000}, function(socket) {
    var client = new Client(socket);
    clients[client.id] = client;

    socket.on('message', function(rawMessage) {
        if (rawMessage == 'ping') {
            socket.send('pong');
        } else {
            var m = JSON.parse(rawMessage);
            switch(m.id) {
                case 'medianRTT':
                    clients[m.clientId].setMedianRTT(m.value);
                    break;
                case 'velocityDiff':
                    console.log('velocitydiff: ', rawMessage);
                    break;
            }
            // console.log('incoming message: ', rawMessage);
        }
    });

    socket.on('close', function() {
        console.log('client', client.toString(), 'leaving: removing from clients');
        delete clients[client.id];
        client.purge();
    });

    console.log('incoming connection: ', client.toString());

    var startPos = spawnPositions[currentSpawnPos];
    client.send(SendMessage.welcome(client.id, startPos.x, startPos.y, time_util.elapsed));

    currentSpawnPos += 1;
    if (currentSpawnPos > 3) currentSpawnPos = 0;
});

console.log('server initialized');