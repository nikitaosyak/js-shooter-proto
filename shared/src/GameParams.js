function GameParams() {}

GameParams.serverUpdateTime = 50;       // milliseconds

GameParams.rttCheckTimeout = 500;
GameParams.rttMedianHistory = 11;

GameParams.playerSpeed = 60;
GameParams.playerRadius = 32;

GameParams.pointerSendRate = GameParams.serverUpdateTime * 0.8;       // milliseconds
GameParams.dStep = 5;

// histories
GameParams.interpolatorHistoryLen = 10;
GameParams.streamingActionsHistoryLen = 50;

GameParams.weapons = {
    railgun: {
        name: 'railgun',
        instant: true,
        rayLength: 800,
        automatic: false,
        recoilTime: 50,
        damage: 100
    }
};

//
// debug values
//
GameParams.serverStateVisible = true;
GameParams.interpolationSnapshotBuffer = 2;
GameParams.additionalVirtualLagMedian = 0;

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
