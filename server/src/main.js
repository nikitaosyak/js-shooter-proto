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
    var startPos = spawnPositions[currentSpawnPos];
    var client = new Client(socket, startPos);
    clients[client.id] = client;

    socket.on('message', function(rawMessage) {
        if (rawMessage == 'ping') {
            socket.send('pong');
        } else {
            var m = JSON.parse(rawMessage);
            switch(m.id) {
                case 'medianRTT':
                    if (m.clientId in clients) {
                        clients[m.clientId].setMedianRTT(m.value);
                    } else {
                        console.log('trying to do medianRTT at %i: does not exist!', m.clientId);
                    }
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

    var startTime = time_util.elapsed;
    client.send(SendMessage.welcome(client.id, startPos.x, startPos.y, startTime));
    broadcast(SendMessage.position(client.id, startPos.x, startPos.y, startTime), client.id);
    iterateClients(function(iterClientId, iterClient) {
        if (iterClientId == client.id) return;
        console.log('sending client', client.id, ' position of', iterClientId);
        client.send(SendMessage.position(iterClient.id, iterClient.pos.x, iterClient.pos.y, startTime));
    });

    currentSpawnPos += 1;
    if (currentSpawnPos > 3) currentSpawnPos = 0;
});

console.log('server initialized');

function broadcast(message, except) {
    iterateClients(function(clientId, client) {
        if (clientId == except) return;
        client.send(message);
    });
}

function iterateClients(action) {
    for (var clientId in clients) {
        action(clientId, clients[clientId]);
    }
}