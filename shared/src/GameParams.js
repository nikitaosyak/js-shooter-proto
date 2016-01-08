function GameParams() {}

GameParams.serverUpdateTime = 100;       // milliseconds
GameParams.playerSpeedX = 240;          // px/sec
GameParams.playerSpeedY = 240;          // px/sec

GameParams.pointerSendRate = 40;       // milliseconds

//
// debug values
//
GameParams.serverStateVisible = true;

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
