var fs = require('fs');
var ws = require('ws');
var time_util = require('./time_util.js');
var Client = require('./client.js');

var shared = require('./shared.gen.js');
var SendMessage = shared.SendMessage;
var GameParams = shared.GameParams;
var simulation = shared.Simulation;
var LevelModel = shared.LevelModel;

var levelRaw = fs.readFileSync('src/assets/map_draft.json');
var level = new LevelModel().fromTiledDescriptor(JSON.parse(levelRaw));
simulation.physics.addStaticBodies(level.bodies);

var spawnPositions = level.respawns;
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
                        console.log('client', m.clientId, 'median rtt:', m.value);
                        clients[m.clientId].setMedianRTT(m.value + GameParams.additionalVirtualLagMedian);
                        clients[m.clientId].send(SendMessage.srvTime(time_util.elapsed));
                    } else {
                        console.log('trying to do medianRTT at %i: does not exist!', m.clientId);
                    }
                    break;
                case 'vd':
                    // console.log('velocitydiff: ', rawMessage);
                    simulation.addStreamAction(
                        time_util.elapsed, clients[m.cid].lag, m.cid, m.x, m.y, m.dt
                    );
                    break;
                case 'pointer':
                    clients[m.cid].pointer.x = m.x;
                    clients[m.cid].pointer.y = m.y;
                    break;
                case 'requestShot':
                    simulation.addInstantAction(
                        time_util.elapsed, client.id, clients[client.id].lag, m.lerp, m.time, m.to
                        );
                    break;
                case 'p':
                    client.send(SendMessage.pong(time_util.elapsed));
                    break;
                case 'p_ack':
                    client.ackPong(time_util.elapsed);
                    break;
            }
            // console.log('incoming message: ', rawMessage);
        }
    });


    socket.on('close', function() {
        console.log('client', client.toString(), 'leaving: removing from clients');
        var removingId = client.id;
        simulation.deleteClient(removingId);
        delete clients[removingId];
        client.purge();
        broadcast(SendMessage.playerDeath([removingId]));
    });

    console.log('incoming connection: ', client.toString());

    simulation.addClient(client.id, startPos.x, startPos.y, time_util.elapsed);
    client.send(SendMessage.welcome(client.id, startPos.x, startPos.y, client.name, true));
    broadcast(SendMessage.welcome(client.id, startPos.x, startPos.y, client.name), client.id);
    iterateClients(function(iterClientId, iterClient) {
        if (iterClientId == client.id) return;
        // console.log('sending client', client.id, ' position of', iterClientId);
        client.send(SendMessage.welcome(iterClient.id, iterClient.pos.x, iterClient.pos.y, iterClient.name));
    });

    currentSpawnPos += 1;
    if (currentSpawnPos > spawnPositions.length-1) currentSpawnPos = 0;
});


time_util.onTimer(function(dt) {
    var currentTime = time_util.elapsed;
    var streamDiff = [];
    iterateClients(function(clientId, client) {
        // console.log('moving client', clientId, client.pos);
        var addPointerToDiff = client.pointer.x !== client.lastSentPointer.x || client.pointer.y !== client.lastSentPointer.y;
        var simulationResult = simulation.simulateClientStream(currentTime, clientId, client.pos);
        
        if (!simulationResult.change && !addPointerToDiff) return;
        
        var d = {clientId: clientId, time:currentTime};
        if (simulationResult.change) {
            client.pos.x = d.x = simulationResult.state.x;
            client.pos.y = d.y = simulationResult.state.y;
        }

        if (addPointerToDiff) {
            d.px = client.pointer.x;
            d.py = client.pointer.y;
            client.lastSentPointer.x = client.pointer.x;
            client.lastSentPointer.y = client.pointer.y;
        }
        streamDiff.push(d);
    });

    if (streamDiff.length !== 0) {
        broadcast(SendMessage.positionBatch(streamDiff));
    }

    var instantResult = simulation.simulateInstantActions(currentTime);
    if (instantResult.length !== 0) {
        for (var i = instantResult.length - 1; i >= 0; i--) {
            var shotData = instantResult[i];
            broadcast(SendMessage.shotAck(shotData.id, shotData.to, shotData.hits));
        }
    }
});

time_util.onLongTimer(function() {
    var currentTime = time_util.now;
    iterateClients(function(clientId, client) {
        client.ping(time_util.elapsed);
    });
});

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

function iterateClientsExcept(exceptId, action) {
    for (var clientId in clients) {
        if (exceptId == clientId) continue;
        action(clientId, clients[clientId]);
    }
}