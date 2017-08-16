var common = require("./common.js");
var MichCoin = artifacts.require("./MichCoin.sol");

function createNew(startAfterSec, icoDurationSec, bonusDurationSec) {
    return MichCoin.new(56470000, 3000000, common.token2ether, startAfterSec, icoDurationSec, bonusDurationSec, common.main, common.reserve);
}

contract("duration", function(accounts) {
    var mich;
    it("should show time", function() {
        return createNew(0, 2, 0).then(function(instance) {
            mich = instance;
            web3.eth.sendTransaction({from:accounts[1], value:common.oneTokenWei, to:mich.address, gas:200000});
            common.sleep(2001);
            common.assertFailTransaction({from:accounts[1], value:common.oneTokenWei, to:mich.address, gas:200000});
        });
    });
});

contract("wait for open", function(accounts) {
    var mich;
    it("should throw exception on trying to buy", function() {
        return createNew(2, 2, 0).then(function(instance) {
            mich = instance;
            common.assertFailTransaction({from:accounts[1], to:mich.address, value:common.oneTokenWei*1, gas:200000});
        });
    });
});

contract("withdraw refund with bonuses", function(accounts) {
    it("should refund", function() {
        var balance1;
        var balance2;
        var balance3;
        var mich;
        return createNew(0, 2, 1).then(function(instance) {
            mich = instance;
            common.sleep(100);
            web3.eth.sendTransaction({from:accounts[1], value:10*common.oneTokenWei, to:mich.address, gas:200000});
            web3.eth.sendTransaction({from:accounts[2], value:common.oneTokenWei, to:mich.address, gas:200000});
            web3.eth.sendTransaction({from:accounts[3], value:0.5*common.oneTokenWei, to:mich.address, gas:200000});
            balance1 = web3.eth.getBalance(accounts[1]);
            balance2 = web3.eth.getBalance(accounts[2]);
            balance3 = web3.eth.getBalance(accounts[3]);
            common.sleep(2001);
            return mich.refund(accounts[1], {from:accounts[7]});
        }).then(function(tx) {
            return mich.refund(accounts[2], {from:accounts[7]});
        }).then(function(tx) {
            return mich.refund(accounts[3], {from:accounts[7]});
        }).then(function(tx) {
            assert.ok(web3.eth.getBalance(accounts[1]).equals(balance1.plus(10*common.oneTokenWei)));
            assert.ok(web3.eth.getBalance(accounts[2]).equals(balance2.plus(common.oneTokenWei)));
            assert.ok(web3.eth.getBalance(accounts[3]).equals(balance3.plus(0.5*common.oneTokenWei)));
            common.assertThrow(mich.withdraw());
        });
    });
});
