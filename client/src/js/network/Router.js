
Router = function(state) {
    console.log("router created");
    this._state = state;
}

Router.prototype.constructor = Router;

Router.prototype = {
    debug: function(message) {
        console.log("incoming debug message: ");
        for (k in message) {
            console.log("%s: %s", k, message[k]);
        }
    },

    welcome: function(message) {
        console.log("incoming welcome message! id obtained:", message.clientId);
        this._state.injectId(message.clientId);
        this._state.injectPos(message.startX, message.startY);
    }
}