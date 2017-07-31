var MichCoin = artifacts.require("./MichCoin.sol");

module.exports = function(deployer, network) {
    console.log("deploying to " + network);
    if (network == "development") {
        var common = require("./../test/common.js");
        deployer.deploy(MichCoin, 56470000, 3000000, common.token2ether, 30, 10, common.main, common.reserve);
    } else if (network == "kovan") {
        //lives for 30 minutes
        //deployer.deploy(MichCoin, 10, 8, 200, 30*60, 4, 8);
    }
};
