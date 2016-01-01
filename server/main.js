var WebSocketServer = require('ws').Server;

var server = new WebSocketServer({host: '0.0.0.0', port:3000});

server.on('connection', function(socket) {

    socket.on('message', function(message) {
        if (message == 'ping') {
            socket.send('pong');
        }
    });

    // for (var k in socket) {
    //     console.log('socket::%s', k);
    // }

    console.log('incoming connection');
})

console.log('server initialized');