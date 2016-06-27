/*jshint esversion: 6*/
_instance = null;
class ServerFacade {

    static get $() {
        if (ServerFacade._instance == null) {
            ServerFacade._instance = new ServerFacade();
        }
        return ServerFacade._instance;
    }

    constructor() {
    }
}