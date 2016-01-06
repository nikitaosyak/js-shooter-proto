function GameParams() {}

GameParams.serverUpdateTime = 50;       // milliseconds
GameParams.playerSpeedX = 240;          // px/sec
GameParams.playerSpeedY = 240;          // px/sec

GameParams.pointerSendRate = 1000;       // milliseconds

//
// debug values
//
GameParams.serverStateVisible = true;

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
