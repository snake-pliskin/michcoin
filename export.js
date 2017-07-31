var m = require("./build/contracts/MichCoin");
console.log("==============ABI==============");
var s = JSON.stringify(m.abi, null, 0);
console.log(s);
console.log("==============BINARY==============");
console.log(m.unlinked_binary);
