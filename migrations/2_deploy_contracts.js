var MichCoin = artifacts.require("./MichCoin.sol");

module.exports = function(deployer, network) {
    console.log("deploying to " + network);
    if (network == "development") {
        deployer.deploy(MichCoin, 10, 8, 200, 10, 4, 8);
    } else if (network == "kovan") {
        //lives for 30 minutes
        deployer.deploy(MichCoin, 10, 8, 200, 30*60, 4, 8);
    }
};
