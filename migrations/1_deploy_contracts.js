var MichCoin = artifacts.require("./MichCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(MichCoin);
};
