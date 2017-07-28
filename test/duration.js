var common = require("./common.js");
var MichCoin = artifacts.require("./MichCoin.sol");

contract("duration", function(accounts) {
    var mich;
    it("should show time", function() {
        return MichCoin.new(20, 9, 215, 1).then(function(instance) {
            mich = instance;
            return mich.buyToken({from:accounts[1], value:9302325581395350}).then(function(tx) {
                common.sleep(1000);
                return common.assertThrow(mich.buyToken({from:accounts[1], value:9302325581395350}));
            });
        });
    });
});
