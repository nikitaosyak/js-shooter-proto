function GameParams() {}

GameParams.serverUpdateTime = 100;     // milliseconds
GameParams.playerSpeedX = 280;          // px/sec
GameParams.playerSpeedY = 280;          // px/sec

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
