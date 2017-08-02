module.exports.main = "0x20dbc213eb4c1fa8a070c595a68531e737711247";
module.exports.reserve = "0xd5183c2a3a2ddf23b59d26fc45f109d88972fcfd";
module.exports.token2ether = 5e7;
module.exports.oneTokenWei = Math.pow(10, 18) / module.exports.token2ether;

module.exports.getTokenAmount = function(tokenCount) {
    return tokenCount*Math.pow(10, 8);
};

module.exports.assertThrow = function(tx) {
    return tx.then( function(result) {
        throw new Error("there should be exception in solidity");
    }, function(err) {
        if (err.message.indexOf("invalid opcode") == -1) {
            throw new Error(err.message);
        }
    });
};

module.exports.getCurrentTime = function() {
    return Math.ceil(new Date().getTime() / 1000);
};

module.exports.sleep = function(ms) {
    ms += new Date().getTime();
    while (new Date().getTime() < ms){}
};

function assertInvalidOpcode(f) {
    try {
        f();
        throw new Error("must throw exception");
    } catch(err) {
        if (err.message.indexOf("invalid opcode") == -1) {
            throw new Error(err.message);
        }
    }
}

module.exports.assertFailTransaction = function(obj) {
    assertInvalidOpcode(function(){web3.eth.sendTransaction(obj);});
};

