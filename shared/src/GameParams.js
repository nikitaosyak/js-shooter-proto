function GameParams() {}

GameParams.serverUpdateTime = 100;       // milliseconds

GameParams.rttCheckTimeout = 500;
GameParams.rttMedianHistory = 11;

GameParams.playerSpeed = 60;
GameParams.playerRadius = 32;

GameParams.pointerSendRate = GameParams.serverUpdateTime * 0.8;       // milliseconds
GameParams.dStep = 5;

GameParams.interpolatorHistoryLen = 10;

//
// debug values
//
GameParams.serverStateVisible = true;
GameParams.interpolationSnapshotBuffer = 2;
GameParams.additionalVirtualLagMedian = 0;

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
