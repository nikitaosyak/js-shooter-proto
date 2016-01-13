function GameParams() {}

GameParams.serverUpdateTime = 100;       // milliseconds

GameParams.playerSpeed = 400;
GameParams.playerRadius = 100;

GameParams.pointerSendRate = GameParams.serverUpdateTime * 0.8;       // milliseconds

//
// debug values
//
GameParams.serverStateVisible = true;
GameParams.interpolationSnapshotBuffer = 2;
GameParams.additionalVirtualLagMedian = 0;

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
