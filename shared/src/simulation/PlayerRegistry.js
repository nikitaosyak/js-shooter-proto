import {Player} from "./entities/Player";

export class PlayerRegistry {
    constructor() {
        this._players = [];
    }

    hasPlayer(id) { return id in this._players; }

    addPlayer(id, x, y) {
        if (this.hasPlayer(id)) throw "registry: already contains player " + id;
        var p = new Player(id, x, y, 'NONAME', false);
        this._players[id] = p;
        return p;
    }

    removePlayer(id) {
        if (!this.hasPlayer(id)) throw "registry: already does not have player " + id;
        this._players[id].destroyPlayer();
        delete this._players[id];
    }

    checkPlayerExist(id) {
        if (!this.hasPlayer(id)) throw 'Registry: does not contains player ' + id;
    }

    // getPlayer(id) {
    //     if (!this.hasPlayer(id)) throw "registry: does not contains player " + id;
    //     return this._players[id];
    // }

    iteratePlayers(iterator) {
        this._players.forEach(p => iterator(p));
    }
}