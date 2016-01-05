function GameParams() {}

GameParams.serverUpdateTime = 200;     // milliseconds
GameParams.playerSpeedX = 80;          // px/sec
GameParams.playerSpeedY = 80;          // px/sec

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
