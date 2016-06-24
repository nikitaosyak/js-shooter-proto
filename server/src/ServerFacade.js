/*jshint esversion: 6*/
class ServerFacade {

    static _instance = null;
    static get $() {
        if (ServerFacade._instance == null) {
            ServerFacade._instance = new ServerFacade();
        }
        return ServerFacade._instance;
    }

    constructor() {
    }
}