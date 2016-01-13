function GameParams() {}

GameParams.serverUpdateTime = 100;       // milliseconds

GameParams.playerSpeed = 200;
GameParams.playerRadius = 64;

GameParams.pointerSendRate = GameParams.serverUpdateTime * 0.8;       // milliseconds
GameParams.dStep = 5;

//
// debug values
//
GameParams.serverStateVisible = true;
GameParams.interpolationSnapshotBuffer = 2;
GameParams.additionalVirtualLagMedian = 0;

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
