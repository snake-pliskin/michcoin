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
    while (new Date() < ms){}
};
