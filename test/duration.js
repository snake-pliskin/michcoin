var common = require("./common.js");
var MichCoin = artifacts.require("./MichCoin.sol");

contract("duration", function(accounts) {
    var mich;
    it("should show time", function() {
        return MichCoin.new(56470000, 3000000, common.token2ether, 1, 0, common.main, common.reserve).then(function(instance) {
            mich = instance;
            return mich.buyToken({from:accounts[1], value:common.oneTokenWei}).then(function(tx) {
                common.sleep(1501);
                return common.assertThrow(mich.buyToken({from:accounts[1], value:common.oneTokenWei}));
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
        return MichCoin.new(56470000, 3000000, common.token2ether, 1, 0, common.main, common.reserve).then(function(instance) {
            mich = instance;
            return mich.buyToken({from:accounts[1], value:10*common.oneTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[2], value:common.oneTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[3], value:0.5*common.oneTokenWei});
        }).then(function(tx) {
            balance1 = web3.eth.getBalance(accounts[1]);
            balance2 = web3.eth.getBalance(accounts[2]);
            balance3 = web3.eth.getBalance(accounts[3]);
            common.sleep(1501);
            return mich.withdraw({from:accounts[7]});
        }).then(function(tx) {
            assert.ok(web3.eth.getBalance(accounts[1]).equals(balance1.plus(10*common.oneTokenWei)));
            assert.ok(web3.eth.getBalance(accounts[2]).equals(balance2.plus(common.oneTokenWei)));
            assert.ok(web3.eth.getBalance(accounts[3]).equals(balance3.plus(0.5*common.oneTokenWei)));
        });
    });
});

contract("withdraw refund with bonuses", function(accounts) {
    it("should refund", function() {
        var balance1;
        var balance2;
        var balance3;
        var mich;
        return MichCoin.new(56470000, 3000000, common.token2ether, 1, 1, common.main, common.reserve).then(function(instance) {
            mich = instance;
            return mich.buyToken({from:accounts[1], value:10*common.oneTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[2], value:common.oneTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[3], value:0.5*common.oneTokenWei});
        }).then(function(tx) {
            balance1 = web3.eth.getBalance(accounts[1]);
            balance2 = web3.eth.getBalance(accounts[2]);
            balance3 = web3.eth.getBalance(accounts[3]);
            common.sleep(1501);
            return mich.withdraw({from:accounts[7]});
        }).then(function(tx) {
            assert.ok(web3.eth.getBalance(accounts[1]).equals(balance1.plus(10*common.oneTokenWei)));
            assert.ok(web3.eth.getBalance(accounts[2]).equals(balance2.plus(common.oneTokenWei)));
            assert.ok(web3.eth.getBalance(accounts[3]).equals(balance3.plus(0.5*common.oneTokenWei)));
        });
    });
});
