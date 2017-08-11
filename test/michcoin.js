var common = require("./common.js");
var MichCoin = artifacts.require("./MichCoin.sol");
var BigNumber = require("bignumber.js");

contract("transfer", function(accounts) {
    var mich;
    it("should put 56470000 MichCoin to first account", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return instance.balanceOf(mich.address);
        }).then(function(tokenAmount) {
            assert.equal(tokenAmount.toNumber(), common.getTokenAmount(56470000), "contract has not 56470000 tokens");
        });
    });
    it("should transfer 8 token to next account", function() {
        var sentTokenNum = 8;
        //this one buys 11 token, cause 10% bonus
        web3.eth.sendTransaction({from:accounts[0], value:common.oneTokenWei*10, to:mich.address, gas:200000});
        return mich.transfer(accounts[1], common.getTokenAmount(sentTokenNum), {from:accounts[0]}).then(function(tx) {
            assert.equal(tx.logs[0].event, "Transfer");
            assert.equal(tx.logs[0].args._from, accounts[0]);
            assert.equal(tx.logs[0].args._to, accounts[1]);
            assert.equal(tx.logs[0].args._value.toNumber(), common.getTokenAmount(sentTokenNum));
            return mich.balanceOf(accounts[0], {from:accounts[0]});
        }).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(3), "first balance invalid");
            return mich.balanceOf(accounts[1], {from:accounts[1]});
        }).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(8), "second balance invalid");
        });
    });
    it("should fail to send 4 tokens", function() {
        return common.assertThrow(mich.transfer(accounts[1], common.getTokenAmount(4), {from:accounts[0]}));
    });
    it("should have 3 and 8 tokens", function() {
        return mich.balanceOf(accounts[0]).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(3), "must have 3 tokens");
            return mich.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), common.getTokenAmount(8), "must have 8 tokens");
        });
    });
    it("should fail to send 0 tokens", function() {
        return common.assertThrow(mich.transfer(accounts[1], 0));
    });
    it("should show 11 token sold", function() {
        return mich.tokenSold().then(function(sold) {
            assert.equal(sold.valueOf(), common.getTokenAmount(11));
        });
    });
    it("should show available token", function() {
        return mich.tokenAvailable().then(function(avail) {
            assert.equal(avail.valueOf(), common.getTokenAmount(56470000*0.85 - 11));
        });
    });
});

contract("transferFrom", function(accounts) {
    var mich;
    it("should buy 11 tokens", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return web3.eth.sendTransaction({from:accounts[0], value:common.oneTokenWei*10, to:mich.address, gas:200000});
        });
    });
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
            assert.equal(balance.toNumber(), common.getTokenAmount(7));
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
    it("should buy 2 tokens ETH", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            web3.eth.sendTransaction({from:accounts[1], value:common.oneTokenWei*2, to:mich.address, gas:200000});
            return mich.balanceOf(accounts[1]).then(function(balance) {
                assert.equal(balance.toNumber(), 2.2e8);
                return mich.balanceOf(mich.address);
            }).then(function(balance) {
                assert.equal(balance.toNumber(), 56470000*1e8 - 2.2e8);
            });
        });
    });
    it("should fail to buy 0 tokens", function() {
        common.assertFailTransaction({from:accounts[1], value:0, to:mich.address, gas:200000});
    });
    it("should fail to buy > 10^-8 tokens", function() {
        common.assertFailTransaction({from:accounts[1], value:common.oneTokenWei*1e-8-1, to:mich.address, gas:200000});
    });
    it("should buy 10^-8 tokens", function() {
        web3.eth.sendTransaction({from:accounts[1], value:common.oneTokenWei*1e-8, to:mich.address, gas:200000});
        return mich.balanceOf(accounts[1]).then(function(balance) {
            assert.equal(balance.toNumber(), 2.2e8 + 1);
        });
    });
    it("should fail to buy 48e6 tokens, because 15% is reserved", function() {
        common.assertFailTransaction({from:accounts[1], value:48e6*common.oneTokenWei, to:mich.address, gas:200000});
    });
    it("should fail to buy 60e6", function() {
        common.assertFailTransaction({from:accounts[1], value:60e6*common.oneTokenWei, to:mich.address, gas:200000});
    });
});

contract("withdraw by selling 85% tokens", function(accounts) {
    var mich;
    var half = new BigNumber('21817954.54545454');
    it("should send funds to owner", function() {
        var ownerStartBalance;
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return web3.eth.getBalance(common.main);
        }).then(function(balance) {
            ownerStartBalance = balance;
            web3.eth.sendTransaction({from:accounts[1], value:half.times(common.oneTokenWei), to:mich.address, gas:200000});
            web3.eth.sendTransaction({from:accounts[2], value:half.times(common.oneTokenWei), to:mich.address, gas:200000});
            web3.eth.sendTransaction({from:accounts[3], value:2e-8*common.oneTokenWei, to:mich.address, gas:200000});
            return mich.withdraw({from:accounts[7]});
        }).then(function(tx) {
            var ownerEndBalance = web3.eth.getBalance(common.main);
            var diff = half.times(2).plus(2e-8).times(common.oneTokenWei);
            assert.ok(ownerEndBalance.equals(ownerStartBalance.plus(diff)));
            return mich.balanceOf(common.reserve);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 56.47e6*0.15*1e8);
        });
    });
});

contract("freeze", function(accounts) {
    var mich;
    it("freezes transfer", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            web3.eth.sendTransaction({from:accounts[0], value:common.oneTokenWei*20, to:mich.address, gas:200000});
            return mich.approve(accounts[1], common.getTokenAmount(1)).then(function(tx) {
                return mich.freeze();
            }).then(function(tx) {
                return common.assertThrow(mich.transfer(accounts[1], common.getTokenAmount(1), {from:accounts[0]}));
            });
        });
    });
    it("freeze approve", function() {
        return common.assertThrow(mich.approve(accounts[1], common.getTokenAmount(1)));
    });
    it("freeze transferFrom", function() {
        return common.assertThrow(mich.transferFrom(accounts[0], accounts[1], common.getTokenAmount(1)));
    });
    it("shoild fail to sendTransaction", function() {
        return common.assertFailTransaction({from:accounts[0], to:mich.address, value:common.oneTokenWei*1, gas:200000});
    });
    it("unfreeze transfer", function() {
        return mich.unfreeze().then(function(tx) {
            return mich.transfer(accounts[1], common.getTokenAmount(1));
        }).then(function(tx) {
            return mich.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(common.getTokenAmount(1), balance.toNumber());
        });
    });
    //withdraw freeze test not implemented
});

contract("owner functions", function(accounts) {
    var mich;
    it("fail to call freeze()", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return common.assertThrow(mich.freeze({from:accounts[1]}));
        });
    });
    it("fail to call unfreeze()", function() {
        return common.assertThrow(mich.unfreeze({from:accounts[1]}));
    });
});
