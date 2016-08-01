/*jshint esversion: 6*/
import {SendMessage} from "./shared.gen";
import {LevelModel} from "./shared.gen"

import {ServerClient} from './ServerClient';
import {TimerUtil} from './TimerUtil';

var fs = require('fs');
var ws = require('ws');
var timerUtil = new TimerUtil();

var shared = require('./shared.gen.js');
var GameParams = shared.GameParams;
var simulation = new shared.Simulation();

var levelRaw = fs.readFileSync(process.env.ASSETS_FOLDER + GameParams.startMap);
var level = new LevelModel(JSON.parse(levelRaw), physics.rectFactory);
simulation.physics.initializeLevel(level);

var spawnPositions = level.respawns;
var currentSpawnPos = 0;

var clients = {};

ws.createServer({host: '0.0.0.0', port:3000}, function(socket) {
    var client = new ServerClient(socket);
    var player = null;
    clients[client.id] = client;

    socket.on('message', function(rawMessage) {
        const elapsed = timerUtil.elapsed;

        var m = JSON.parse(rawMessage);
        // console.log(m, 'from ', client.id);
        switch(m.id) {
            case 'medianRTT':
                if (m.clientId in clients) {
                    // console.log('client', m.clientId, 'median rtt:', m.value);
                    clients[m.clientId].setMedianRTT(m.value + GameParams.additionalVirtualLagMedian);
                    clients[m.clientId].send(SendMessage.srvTime(elapsed));
                } else {
                    console.log('trying to do medianRTT at %i: does not exist!', m.clientId);
                }
                break;
            case 'vd':
                // console.log('velocitydiff: ', rawMessage, client.id);
                simulation.addStreamAction(
                    elapsed, client.lag, client.id, m.x, m.y, m.dt
                );
                break;
            case 'pointer':
                if (!player.alive) return;
                player.pointer.x = m.x;
                player.pointer.y = m.y;
                break;
            case 'requestShot':
                simulation.addInstantAction(
                    elapsed, client.id, client.lag, m.lerp, m.time, m.to
                    );
                break;
            case 'requestSpawn':
                player = spawnPlayer(client, false);
                break;
            case 'p':
                client.send(JSON.stringify({id:"p_ack", time:elapsed}));
                break;
            case 'changeName':
                // console.log("change name request to " + m.name);
                var canChange = true;
                iterateClients(function(cleintId, client) {
                    if (client.name === m.name) {
                        canChange = false;
                        console.log("client %s already have name %s!", client.id, client.name);
                    }
                });

                if (canChange) {
                    client._name = m.name;
                    if (player) {
                        player.name = m.name;
                    }
                    broadcast(SendMessage.changeName(client.id, m.name));
                }
                break;
        }
            // console.log('incoming message: ', rawMessage);
    });


    socket.on('close', function() {
        console.log('main: client', client.toString(), 'leaving: removing from clients');
        
        var removingId = client.id;
        simulation.deleteClient(removingId);
        delete clients[removingId];
        client.purge();

        broadcast(SendMessage.clientLeave([removingId]));
    });

    console.log('main: incoming connection: ', client.toString());
    player = spawnPlayer(client, true);
});

timerUtil.addTimer(GameParams.serverUpdateTime, function(dt){
    "use strict";
    const currentTime = timerUtil.elapsed;
    var streamDiff = [];

    simulation.registry.iteratePlayers(function(player) {
        if (!player.alive) return;
        // console.log('moving client', clientId, client.pos);
        var addPointerToDiff = player.pointer.x !== player.lastSentPointer.x || player.pointer.y !== player.lastSentPointer.y;
        var simulationResult = simulation.simulateClientStream(currentTime, player.id, player.pos);

        if (!simulationResult.change && !addPointerToDiff) return;

        var d = {clientId: player.id, time:currentTime};
        if (simulationResult.change) {
            player.pos.x = d.x = simulationResult.state.x;
            player.pos.y = d.y = simulationResult.state.y;
        }

        if (addPointerToDiff) {
            d.px = player.pointer.x;
            d.py = player.pointer.y;
            player.lastSentPointer.x = player.pointer.x;
            player.lastSentPointer.y = player.pointer.y;
        }
        streamDiff.push(d);
    });

    if (streamDiff.length !== 0) {
        broadcast(SendMessage.positionBatch(streamDiff));
    }

    var instantResult = simulation.simulateInstantActions(currentTime);
    if (instantResult.length !== 0) {
        broadcast(SendMessage.shotAck(instantResult));
        for (var i = instantResult.length - 1; i >= 0; i--) {
            var shotData = instantResult[i];
            broadcast(SendMessage.playerDeath(shotData.id, shotData.hits));

            for (var j = shotData.hits.length - 1; j >= 0; j--) {
                var cid = shotData.hits[j];
                console.log('client', cid, ' is dead, will remove from simulation');
                simulation.deleteClient(cid);
            }
        }
    }
});

timerUtil.addTimer(GameParams.rttCheckTimeout, function() {
    "use strict";
    const elapsed = timerUtil.elapsed;
    iterateClients(function(clientId, client) {
        client.ping(elapsed);
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

function spawnPlayer(client, notifyOfOtherPlayers) {
    console.log('will spawn player ', client.id);
    var startPos = spawnPositions[currentSpawnPos];

    var player = simulation.addClient(client.id, startPos.x, startPos.y, timerUtil.elapsed);
    broadcast(SendMessage.welcome(client.id, startPos.x, startPos.y, client.name, false), client.id);
    
    if (notifyOfOtherPlayers) {
        simulation.registry.iteratePlayers(
            function (player) {
                console.log('sending player %s to client %s. wtf? %s', player.id, client.id, player.id === client.id);
                var isSelf = player.id === client.id;
                client.send(SendMessage.welcome(player.id, player.pos.x, player.pos.y, clients[player.id].name, isSelf));
            }
        );    
    } else {
        client.send(SendMessage.welcome(player.id, player.pos.x, player.pos.y, client.name, true));
    }

    currentSpawnPos += 1;
    if (currentSpawnPos > spawnPositions.length-1) currentSpawnPos = 0;

    return player;
}