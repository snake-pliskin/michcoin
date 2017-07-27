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

contract("MichCoin transfer", function(accounts) {
    var mich;
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
        return mich.transfer(accounts[1], getTokenAmount(sentTokenNum), {from:accounts[0]}).then(function(tx) {
            assert.equal(tx.logs[0].event, "Transfer");
            assert.equal(tx.logs[0].args._from, accounts[0]);
            assert.equal(tx.logs[0].args._to, accounts[1]);
            assert.equal(tx.logs[0].args._value.toNumber(), getTokenAmount(sentTokenNum));
            return mich.balanceOf(accounts[0], {from:accounts[0]});
        }).then(function(balance) {
            assert.equal(balance.toNumber(), getTokenAmount(2), "first balance invalid");
            return mich.balanceOf(accounts[1], {from:accounts[1]});
        }).then(function(balance) {
            assert.equal(balance.toNumber(), getTokenAmount(8), "second balance invalid");
        });
    });
    it("should fail to send 3 tokens", function() {
        return assertThrow(mich.transfer(accounts[1], getTokenAmount(3), {from:accounts[0]}));
    });
    it("should have 2 and 8 tokens", function() {
        return mich.balanceOf(accounts[0]).then(function(balance) {
            assert.equal(balance.toNumber(), getTokenAmount(2), "must have 2 tokens");
            return mich.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), getTokenAmount(8), "must have 8 tokens");
        });
    });
    it("should fail to send 0 tokens", function() {
        return assertThrow(mich.transfer(accounts[1], 0));
    });
})

contract("MichCoin transferFrom", function(accounts) {
    var mich;
    it("should fail to transferFrom without approving", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            return assertThrow(mich.transferFrom(accounts[0], accounts[1], getTokenAmount(4)));
        });
    });
    it("should allow 5 token transfer", function() {
        return mich.approve(accounts[1], getTokenAmount(5)).then(function(tx) {
            assert.equal(tx.logs[0].event, "Approval");
            assert.equal(tx.logs[0].args._owner, accounts[0]);
            assert.equal(tx.logs[0].args._spender, accounts[1]);
            assert.equal(tx.logs[0].args._value.toNumber(), getTokenAmount(5));
            return mich.allowance(accounts[0], accounts[1], {from:accounts[1]});
        }).then(function(allowed) {
            assert.equal(allowed.toNumber(), getTokenAmount(5), "Must be allowed 5 token transfer");
        });
    });
    it("should transferFrom 4 tokens", function() {
        return mich.transferFrom(accounts[0], accounts[1], getTokenAmount(4)).then(function(tx) {
            assert.equal(tx.logs[0].event, "Transfer");
            assert.equal(tx.logs[0].args._from, accounts[0]);
            assert.equal(tx.logs[0].args._to, accounts[1]);
            assert.equal(tx.logs[0].args._value.toNumber(), getTokenAmount(4));
            return mich.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), getTokenAmount(6));
            return mich.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), getTokenAmount(4));
            return mich.allowance(accounts[0], accounts[1]);
        }).then(function(allowed) {
            assert.equal(allowed.toNumber(), getTokenAmount(1));
        });
    });
    it("should fail to send 0 tokens", function() {
        return assertThrow(mich.transferFrom(accounts[0], accounts[1], 0));
    });
    it("should allow 99 token and fail to send 20", function() {
        return mich.approve(accounts[1], getTokenAmount(99)).then(function(tx) {
            return assertThrow(mich.transferFrom(accounts[0], accounts[1], getTokenAmount(20)));
        });
    });
    it("should allow 1 token and fail to send 2", function() {
        return mich.approve(accounts[1], getTokenAmount(1)).then(function(tx) {
            return assertThrow(mich.transferFrom(accounts[0], accounts[1], getTokenAmount(2)));
        });
    });
});

contract("MichCoin buy", function(accounts) {
    var mich;
    it("should buy 2 tokens for 2/215 ETH", function() {
        return MichCoin.deployed().then(function(instance) {
            mich = instance;
            var money = 2*Math.pow(10, 18)/215; //rounding problem occurs, so magic constant was used below
            return mich.buyToken({from:accounts[1], value:9302325581395350}).then(function(tx) {
                return mich.balanceOf(accounts[1]);
            }).then(function(balance) {
                assert.equal(balance.toNumber(), getTokenAmount(2));
                return mich.balanceOf(accounts[0]);
            }).then(function(balance) {
                assert.equal(balance.toNumber(), getTokenAmount(8));
            });
        });
    })
});
