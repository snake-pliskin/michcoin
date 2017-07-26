var MichCoin = artifacts.require("./MichCoin.sol");

function getTokenAmount(tokenCount) {
    return tokenCount*Math.pow(10, 8);
}

function assertThrow(tx) {
    return tx.then( function(result) {
        throw new Error("there should be exception in solidity");
    }, function(err) {
        if (err.message.indexOf("invalid opcode") == -1) {
            throw new Error(err.message);
        }
    });
}

contract("MichCoin", function(accounts) {
    var mich;
    var first = accounts[0];
    var second = accounts[1];
    it("should put 10 MichCoin to first account", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return instance.balanceOf(accounts[0]);
        }).then(function(tokenAmount) {
            assert.equal(tokenAmount, getTokenAmount(10), "owner has not 10 tokens");
        });
    });
    it("should transfer 8 token to next account", function() {
        var sentTokenNum = 8;
        var firstStartBalance;
        var secondStartBalance;
        var firstEndBalance;
        var secondEndBalance;
        return mich.balanceOf(first, {from:first}).then(function(firstBalance) {
            firstStartBalance = firstBalance.toNumber();
            return mich.balanceOf(second, {from:second});
        }).then(function(secondBalance) {
            secondStartBalance = secondBalance.toNumber();
            return mich.transfer(second, getTokenAmount(sentTokenNum), {from:first});
        }).then(function(txId) {
            return mich.balanceOf(first, {from:first});
        }).then(function(firstBalance) {
            firstEndBalance = firstBalance.toNumber();
            return mich.balanceOf(second, {from:second});
        }).then(function(secondBalance) {
            secondEndBalance = secondBalance.toNumber();
            assert.equal(firstEndBalance, firstStartBalance - getTokenAmount(sentTokenNum), "first balance invalid");
            assert.equal(secondEndBalance, secondStartBalance + getTokenAmount(sentTokenNum), "second balance invalid");
        });
    });
    it("should fail to send 3 tokens", function() {
        return assertThrow(mich.transfer(second, getTokenAmount(3), {from:first}));
    });
    it("should test sum", function() {
        assert.equal(19+1, 20, "oops, sum is not 20");
    });
});

