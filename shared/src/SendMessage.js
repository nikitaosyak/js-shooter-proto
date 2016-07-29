export class SendMessage {
    static welcome(clientId, x, y, name, isMe) {
        var m = {
            'id': 'welcome',
            'clientId': clientId, 'startX': x, 'startY': y, 'name': name, 'me': isMe
        };
        return JSON.stringify(m);
    }

    static srvTime(time) {
        var m = {
            'id': 'srvTime', 'time': time
        };
        return JSON.stringify(m);
    }

    static positionBatch(stampsArray) {
        return JSON.stringify({'id': 'positionBatch', 'value': stampsArray});
    }

    static playerDeath(killer, victims) {
        return JSON.stringify({'id': 'playerDeath', killer: killer, 'victims': victims});
    }

    static clientLeave(clients) {
        return JSON.stringify({'id': 'clientLeave', 'value': clients});
    }

    static shotAck(value) {
        return JSON.stringify({id: 'shotAck', value: value});
    }
}