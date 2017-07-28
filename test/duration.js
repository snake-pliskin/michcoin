var common = require("./common.js");
var MichCoin = artifacts.require("./MichCoin.sol");

var twoTokenWei = 9302325581395350;
var oneTokenWei = 4651162790697675;
var halfTokenWei = 2325581395348838;

contract("duration", function(accounts) {
    var mich;
    it("should show time", function() {
        return MichCoin.new(20, 9, 215, 1).then(function(instance) {
            mich = instance;
            return mich.buyToken({from:accounts[1], value:oneTokenWei}).then(function(tx) {
                common.sleep(1000);
                return common.assertThrow(mich.buyToken({from:accounts[1], value:oneTokenWei}));
            });
        });
    });
});

contract("withdraw refund", function(accounts) {
    it("should refund", function() {
        var balance1;
        var balance2;
        var balance3;
        var mich;
        return MichCoin.new(20, 8, 215, 1).then(function(instance) {
            mich = instance;
            return mich.buyToken({from:accounts[1], value:oneTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[2], value:oneTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[3], value:halfTokenWei});
        }).then(function(tx) {
            balance1 = web3.eth.getBalance(accounts[1]).toNumber();
            balance2 = web3.eth.getBalance(accounts[2]).toNumber();
            balance3 = web3.eth.getBalance(accounts[3]).toNumber();
            common.sleep(2000);
            return mich.withdraw({from:accounts[7]});
        }).then(function(tx) {
            assert.equal(web3.eth.getBalance(accounts[1]).toNumber(), balance1 + oneTokenWei);
            assert.equal(web3.eth.getBalance(accounts[2]).toNumber(), balance2 + oneTokenWei);
            assert.equal(web3.eth.getBalance(accounts[3]).toNumber(), balance3 + halfTokenWei);
        });
    });
});
