var MichCoin = artifacts.require("./MichCoin.sol");

module.exports = function(deployer, network) {
    console.log("deploying to " + network);
    if (network == "development") {
        var common = require("./../test/common.js");
        var tokenCount    = 56470000;
        var minTokenCount =  3000000;
        var beginDurationSec = 0;
        var durationSec = 30;
        var bonusDurationSec = 10;
        deployer.deploy(MichCoin, tokenCount, minTokenCount, common.token2ether, beginDurationSec, durationSec, bonusDurationSec, common.main, common.reserve);
    } else if (network == "kovan") {
        //lives for 30 minutes
        //deployer.deploy(MichCoin, 10, 8, 200, 30*60, 4, 8);
    }
};
