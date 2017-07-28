var MichCoin = artifacts.require("./MichCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(MichCoin, 10, 8, 200, 10, 4, 8);
};
