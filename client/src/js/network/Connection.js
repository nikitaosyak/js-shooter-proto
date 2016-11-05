/*jshint esversion: 6*/
import {ClientRouter} from "./ClientRouter";
import {RPC} from "./RPC";
import {ServerSync} from "./ServerSync";
export class Connection extends EventEmitter
{
    /** @return {string} */
    static get READY() { return 'connection_ready'; }
    /** @return {string} */
    static get ERROR() { return 'connection_error'; }
    /** @return {string} */
    static get CLOSE() { return 'connection_close'; }

    /**
     * @param host {string}
     * @param port {Number}
     */
    constructor(host, port) {
        super();
        this._host = host;
        this._port = port;

        /**
         * @type {WebSocket}
         * @private
         */
        this._socket = null;

        /**
         * @type {ServerSync}
         * @private
         */
        this._sync = null;
        /**
         * @type {RPC}
         * @private
         */
        this._rpc = null;
        /**
        * @type {ClientRouter}
        * @private
        */
        this._router = null;
    }

    /** @returns {boolean} */
    get ready() { return this._socket !== null && this._socket.readyState === 1; }

    /** @returns {ServerSync} */
    get sync() { return this._sync; }

    /** @returns {RPC} */
    get rpc() { return this._rpc; }

    connect() {
        this._socket = new WebSocket('ws://' + this._host + ':' + this._port);
        let self = this;

        this._socket.onopen = () => {
            console.log('connected to', self._host, ':', self._port);
            self._sync = new ServerSync(self._socket);
            self._rpc = new RPC(self._socket);
            self._router = new ClientRouter();
            self.emit(Connection.READY);
        };

        this._socket.onmessage = m => {
            let data = m.data;
            let command = JSON.parse(data);
            console.log('Connection : MESSAGE:', command.id, command);

            self._router.execute(command.id, command);
        };

        this._socket.onerror = e => {
            console.log(typeof self, ': ERROR: ', e);
            self.emit(Connection.ERROR, e);
        };

        this._socket.onclose = e => {
            console.log(typeof self, ': CLOSE: ', e);
            self.emit(Connection.CLOSE, e);
        };
    }
}