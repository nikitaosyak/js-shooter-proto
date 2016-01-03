function SharedUtils() {}

SharedUtils.sortAcc = function(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
};

if (typeof module !== 'undefined') {
    module.exports.SharedUtils = SharedUtils;
}