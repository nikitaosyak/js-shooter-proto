var ws = require('ws');
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

    socket.on('message', function(message) {
        if (message == 'ping') {
            socket.send('pong');
        } else {
            console.log('incoming message: ', message);
        }
    });

    socket.on('close', function() {
        console.log('client', client.toString(), 'leaving: removing from clients');
        delete clients[client.id];
        client.purge();
    });

    console.log('incoming connection: ', client.toString());

    var startPos = spawnPositions[currentSpawnPos];
    var welcome = {'id': 'welcome', 'clientId': client.id, 'startX': startPos.x, 'startY': startPos.y};
    currentSpawnPos += 1;
    if (currentSpawnPos > 3) currentSpawnPos = 0;
    client.send(JSON.stringify(welcome));
});

console.log('server initialized');