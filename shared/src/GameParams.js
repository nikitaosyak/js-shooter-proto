function GameParams() {}

GameParams.serverUpdateTime = 100;       // milliseconds

GameParams.playerSpeed = 240;
GameParams.playerRadius = 64;

GameParams.pointerSendRate = GameParams.serverUpdateTime * 0.8;       // milliseconds
GameParams.dStep = 5;

//
// debug values
//
GameParams.serverStateVisible = false;
GameParams.interpolationSnapshotBuffer = 2;
GameParams.additionalVirtualLagMedian = 0;

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
