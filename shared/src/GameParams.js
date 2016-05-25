function GameParams() {}

GameParams.serverUpdateTime = 40;       // milliseconds

GameParams.rttCheckTimeout = 500;
GameParams.rttMedianHistory = 11;

GameParams.playerSpeed = 60;
GameParams.playerRadius = 32;

GameParams.pointerSendRate = GameParams.serverUpdateTime * 0.8;       // milliseconds
GameParams.dStep = 7;

// histories
GameParams.interpolatorHistoryLen = 10;
GameParams.streamingActionsHistoryLen = 10;

GameParams.weapons = {
    rayCast: {
        rayLength: 800,
    },
    railgun: {
        name: 'railgun',
        type: 'rayCast',
        automatic: false,
        recoilTime: 50,
        damage: 100
    }
};

//
// debug values
//
GameParams.serverStateVisible = false;
GameParams.interpolationSnapshotBuffer = 2;
GameParams.additionalVirtualLagMedian = 0;
GameParams.startMap = 'small_map.json';

if (typeof module !== 'undefined') {
    module.exports.GameParams = GameParams;
}
