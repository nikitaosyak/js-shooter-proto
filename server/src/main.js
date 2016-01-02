var WebSocketServer = require('ws').Server;

var server = new WebSocketServer({host: '0.0.0.0', port:3000});

server.on('connection', function(socket) {

    socket.on('message', function(message) {
        if (message == 'ping') {
            socket.send('pong');
        } else {
            console.log('incoming message: ', message);
        }
    });
    console.log('incoming connection');

    var d = {'id': 'debug', 8080: 33, 'ale': 'privet'};
    socket.send(JSON.stringify(d));
});


console.log('server initialized');