var common = require("./common.js");
var MichCoin = artifacts.require("./MichCoin.sol");

contract("duration", function(accounts) {
    var mich;
    it("should show time", function() {
        return MichCoin.new(56470000, 3000000, common.token2ether, 1, 0, common.main, common.reserve).then(function(instance) {
            mich = instance;
            return mich.buyToken({from:accounts[1], value:common.oneTokenWei}).then(function(tx) {
                common.sleep(1200);
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
            balance1 = web3.eth.getBalance(accounts[1]).toNumber();
            balance2 = web3.eth.getBalance(accounts[2]).toNumber();
            balance3 = web3.eth.getBalance(accounts[3]).toNumber();
            common.sleep(2000);
            return mich.withdraw({from:accounts[7]});
        }).then(function(tx) {
            assert.equal(web3.eth.getBalance(accounts[1]).toNumber(), balance1 + 10*common.oneTokenWei);
            assert.equal(web3.eth.getBalance(accounts[2]).toNumber(), balance2 + common.oneTokenWei);
            assert.equal(web3.eth.getBalance(accounts[3]).toNumber(), balance3 + 0.5*common.oneTokenWei);
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
            balance1 = web3.eth.getBalance(accounts[1]).toNumber();
            balance2 = web3.eth.getBalance(accounts[2]).toNumber();
            balance3 = web3.eth.getBalance(accounts[3]).toNumber();
            common.sleep(2000);
            return mich.withdraw({from:accounts[7]});
        }).then(function(tx) {
            assert.equal(web3.eth.getBalance(accounts[1]).toNumber(), balance1 + 10*common.oneTokenWei);
            assert.equal(web3.eth.getBalance(accounts[2]).toNumber(), balance2 + common.oneTokenWei);
            assert.equal(web3.eth.getBalance(accounts[3]).toNumber(), balance3 + 0.5*common.oneTokenWei);
        });
    });
});
