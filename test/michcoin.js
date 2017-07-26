var MichCoin = artifacts.require("./MichCoin.sol");

function getTokenAmount(tokenCount) {
    return tokenCount*Math.pow(10, 8);
}

function printObject(obj) {
    var s = JSON.stringify(obj, null, 4);
    console.log(s);
}

function assertThrow(tx, message) {
    tx.then(function(object){
        printObject(object);
        assert.fail("jopa");
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
        tx = mich.transfer(second, getTokenAmount(3), {from:first});
        tx.catch(function(error) {
            printObject(error);
            assert.fail("sdsdsadd");
        }).then(function(result) {
            console.log("AA");
            printObject(result);
            assert.equal(1, 2);
        });
//        return assertThrow(mich.transfer(second, getTokenAmount(3), {from:first}), "transfer has not failed");
    });
});

