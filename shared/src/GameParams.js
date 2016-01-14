function GameParams() {}

GameParams.serverUpdateTime = 50;       // milliseconds

GameParams.playerSpeed = 80;
GameParams.playerRadius = 32;

GameParams.pointerSendRate = GameParams.serverUpdateTime * 0.8;       // milliseconds
GameParams.dStep = 5;

//
// debug values
//
GameParams.serverStateVisible = false;
GameParams.interpolationSnapshotBuffer = 3;
GameParams.additionalVirtualLagMedian = 0;

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
