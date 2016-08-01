export class GameParams {
    constructor() {}

    static get serverStateVisible() { return false; }
    static get interpolationSnapshotBuffer() { return 2; }
    static get additionalVirtualLagMedian() { return 0; }
    static get startMap() { return 'small_map.json'; }

    static get serverUpdateTime() { return 40; }

    static get playerSpeed() { return 60; }
    static get playerRadius() { return 32; }
    
    static get pointSyncSendRate() { return GameParams.serverUpdateTime * 0.9; }
    static get dStep() { return 7; }
    
    static get weapons() {
        return {
            rayCast: {
                rayLength: 800
            },
            railgun: {
                name: 'railgun',
                type: 'rayCast',
                automatic: false,
                recoilTime: 50,
                damage: 100
            }
        };
    }


}