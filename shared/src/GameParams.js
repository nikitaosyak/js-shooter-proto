function GameParams() {}

GameParams.serverUpdateTime = 300;     // milliseconds
GameParams.playerSpeedX = 180;          // px/sec
GameParams.playerSpeedY = 180;          // px/sec

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
