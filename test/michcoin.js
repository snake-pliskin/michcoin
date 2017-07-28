var common = require("./common.js");
var MichCoin = artifacts.require("./MichCoin.sol");

var twoTokenWei = 10e15;
var oneTokenWei = 5e15;
var halfTokenWei = 2.5e15;

contract("transfer", function(accounts) {
    var mich;
    it("should put 10 MichCoin to first account", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return instance.balanceOf(accounts[0]);
        }).then(function(tokenAmount) {
            assert.equal(tokenAmount, common.getTokenAmount(10), "owner has not 10 tokens");
        });
    });
    it("should transfer 8 token to next account", function() {
        var sentTokenNum = 8;
        return mich.transfer(accounts[1], common.getTokenAmount(sentTokenNum), {from:accounts[0]}).then(function(tx) {
            assert.equal(tx.logs[0].event, "Transfer");
            assert.equal(tx.logs[0].args._from, accounts[0]);
            assert.equal(tx.logs[0].args._to, accounts[1]);
            assert.equal(tx.logs[0].args._value.toNumber(), common.getTokenAmount(sentTokenNum));
            return mich.balanceOf(accounts[0], {from:accounts[0]});
        }).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(2), "first balance invalid");
            return mich.balanceOf(accounts[1], {from:accounts[1]});
        }).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(8), "second balance invalid");
        });
    });
    it("should fail to send 3 tokens", function() {
        return common.assertThrow(mich.transfer(accounts[1], common.getTokenAmount(3), {from:accounts[0]}));
    });
    it("should have 2 and 8 tokens", function() {
        return mich.balanceOf(accounts[0]).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(2), "must have 2 tokens");
            return mich.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(8), "must have 8 tokens");
        });
    });
    it("should fail to send 0 tokens", function() {
        return common.assertThrow(mich.transfer(accounts[1], 0));
    });
});

contract("transferFrom", function(accounts) {
    var mich;
    it("should fail to transferFrom without approving", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return common.assertThrow(mich.transferFrom(accounts[0], accounts[1], common.getTokenAmount(4)));
        });
    });
    it("should allow 5 token transfer", function() {
        return mich.approve(accounts[1], common.getTokenAmount(5)).then(function(tx) {
            assert.equal(tx.logs[0].event, "Approval");
            assert.equal(tx.logs[0].args._owner, accounts[0]);
            assert.equal(tx.logs[0].args._spender, accounts[1]);
            assert.equal(tx.logs[0].args._value.toNumber(), common.getTokenAmount(5));
            return mich.allowance(accounts[0], accounts[1], {from:accounts[1]});
        }).then(function(allowed) {
            assert.equal(allowed.toNumber(), common.getTokenAmount(5), "Must be allowed 5 token transfer");
        });
    });
    it("should transferFrom 4 tokens", function() {
        return mich.transferFrom(accounts[0], accounts[1], common.getTokenAmount(4)).then(function(tx) {
            assert.equal(tx.logs[0].event, "Transfer");
            assert.equal(tx.logs[0].args._from, accounts[0]);
            assert.equal(tx.logs[0].args._to, accounts[1]);
            assert.equal(tx.logs[0].args._value.toNumber(), common.getTokenAmount(4));
            return mich.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(6));
            return mich.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(4));
            return mich.allowance(accounts[0], accounts[1]);
        }).then(function(allowed) {
            assert.equal(allowed.toNumber(), common.getTokenAmount(1));
        });
    });
    it("should fail to send 0 tokens", function() {
        return common.assertThrow(mich.transferFrom(accounts[0], accounts[1], 0));
    });
    it("should allow 99 token and fail to send 20", function() {
        return mich.approve(accounts[1], common.getTokenAmount(99)).then(function(tx) {
            return common.assertThrow(mich.transferFrom(accounts[0], accounts[1], common.getTokenAmount(20)));
        });
    });
    it("should allow 1 token and fail to send 2", function() {
        return mich.approve(accounts[1], common.getTokenAmount(1)).then(function(tx) {
            return common.assertThrow(mich.transferFrom(accounts[0], accounts[1], common.getTokenAmount(2)));
        });
    });
});

contract("buyToken", function(accounts) {
    var mich;
    it("should buy 2 tokens for 2/200 ETH", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return mich.buyToken({from:accounts[1], value:twoTokenWei}).then(function(tx) {
                return mich.balanceOf(accounts[1]);
            }).then(function(balance) {
                assert.equal(balance.toNumber(), common.getTokenAmount(2));
                return mich.balanceOf(accounts[0]);
            }).then(function(balance) {
                assert.equal(balance.toNumber(), common.getTokenAmount(8));
            });
        });
    });
    it("should fail to buy 0 tokens", function() {
        return common.assertThrow(mich.buyToken({from:accounts[1], value:0}));
    });
    it("should fail to buy > 10^-8 tokens", function() {
        return common.assertThrow(mich.buyToken({from:accounts[1], value:oneTokenWei*1e-8-1}));
    });
    it("should buy 10^-8 tokens", function() {
        return mich.buyToken({from:accounts[1], value:oneTokenWei*1e-8}).then(function(tx) {
            return mich.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(2.00000001));
        });
    });
    it("should fail to buy 7 tokens, because maxToken=8", function() {
        return common.assertThrow(mich.buyToken({from:accounts[1], value:7*oneTokenWei}));
    });
});

contract("withdraw", function(accounts) {
    var mich;
    it("should send funds to owner", function() {
        var ownerStartBalance;
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return web3.eth.getBalance(accounts[0]);
        }).then(function(balance) {
            ownerStartBalance = balance.toNumber();
            return mich.buyToken({from:accounts[1], value:twoTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[2], value:twoTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[3], value:oneTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[4], value:oneTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[5], value:oneTokenWei});
        }).then(function(tx) {
            return mich.buyToken({from:accounts[6], value:oneTokenWei});
        }).then(function(tx) {
            return mich.withdraw({from:accounts[7]});
        }).then(function(tx) {
            var ownerEndBalance = web3.eth.getBalance(accounts[0]).toNumber();
            assert.equal(ownerEndBalance, ownerStartBalance + 4*twoTokenWei);
        });
    });
});

