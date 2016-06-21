InGameConsole = function() {
    this._div = document.getElementById("consoleDiv");
    this._output = document.getElementById("consoleOutput");
    this._input = document.getElementById("consoleInput");

    this._visible = false;
    this._div.style.display = "none";
    
    this._output.value = "commands:\n";
    this._output.value += "setname\n";
};
InGameConsole.prototype.constructor = InGameConsole;

InGameConsole.prototype = {
    toggle: function() {
        if (this._visible) {
            this._hide();
        } else {
            this._show();
        }
    },

    parseCommand: function() {
        var cmd = this._input.value;
        this._input.value = "";

        var verb = cmd.split(" ")[0];
        if (verb == 'setname') {
            this._output.value += "name changed to " + cmd.split(" ")[1] + "\n";
            var name = cmd.split(" ")[1];
            Facade.connection.sendChangeName(name.substring(0, 10));
        } else if (verb == 'say') {
            this._output.value += "you say: " + cmd.split(" ")[1] + "\n";
        } else {
            this._output.value += cmd + ": unknown command\n";
        }
    },

    /** @private */
    _show: function() {
        this._div.style.display = "inline";
        this._visible = true;
        this._input.focus();
    },

    /** @private */
    _hide: function() {
        this._div.style.display = "none";
        this._visible = false;
    }
};

Object.defineProperty(InGameConsole.prototype, "visible", {
    get: function() {
        return this._visible;
    }
});