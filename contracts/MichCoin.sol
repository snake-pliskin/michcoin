pragma solidity ^0.4.4;
import './ERC20.sol';

contract MichCoin is ERC20 {

    string public constant name = "Mich Coin";
    string public constant symbol = "MI4";
    uint public decimals;
    uint public tokenToEtherRate;
    uint public startTime;
    uint public durationTime;
    uint public minTokens;
    uint public maxTokens;
    bool public buyTokenEnabled;
    address owner;

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;
    address[] keys;

    function MichCoin(uint _tokenCount, uint _decimals, uint _tokenToEtherRate, uint _durationInSec) {
        tokenToEtherRate = _tokenToEtherRate;
        decimals = _decimals;
        minTokens = 4*(10**decimals);
        maxTokens = 8*(10**decimals);
        totalSupply = _tokenCount*(10**decimals);
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
        startTime = now;
        durationTime = _durationInSec;
        buyTokenEnabled = true;
    }

    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }

    function transfer(address _to, uint _value) returns (bool success) {
        require(balances[msg.sender] >= _value);
        require(balances[_to] + _value > balances[_to]);

        if (balances[_to] == 0) {
            keys.push(_to);
        }
        balances[msg.sender] -= _value;
        balances[_to] += _value;

        Transfer(msg.sender, _to, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint _value) returns (bool success) {
        require(balances[msg.sender] >= _value);
        require(allowed[_from][_to] >= _value);
        require(balances[_to] + _value > balances[_to]);

        if (balances[_to] == 0) {
            keys.push(_to);
        }
        balances[_from] -= _value;
        balances[_to] += _value;
        allowed[_from][_to] -= _value;

        Transfer(_from, _to, _value);

        return true;
    }

    function approve(address _spender, uint _value) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint remaining) {
        return allowed[_owner][_spender];
    }

    function buyToken() payable {
        uint tokenAmount = tokenToEtherRate * msg.value * (10**decimals) / (10**18);

        require(now - startTime < durationTime);
        require(balances[owner] - tokenAmount >= totalSupply - maxTokens);
        require(balances[msg.sender] + tokenAmount > balances[msg.sender]);

        if (balances[msg.sender] == 0) {
            keys.push(msg.sender);
        }
        balances[owner] -= tokenAmount;
        balances[msg.sender] += tokenAmount;
    }

//    function finish() {
//        if (now - startTime > durationTime || balances[owner] < totalSupply - maxTokens) {
//            buyTokenEnabled = false;
//        }
//        if (!buyTokenEnabled) {
//            if (totalSupply - balances[owner] < minTokens) { //Продали мало, возврат средств
//                if (balances[msg.sender] > 0) {
//                    uint clientAmount = balances[msg.sender] * (10**18) / (10**decimals) / tokenToEtherRate ;
//                    msg.sender.transfer(clientAmount);
//                    balances[owner] += balances[msg.sender];
//                    balances[msg.sender] = 0;
//                }
//            } else { //Передаем все хозяину
//                owner.transfer(this.balance);
//            }
//        }
//    }

    function withdraw() {
        require(now - startTime > durationTime || balances[owner] <= totalSupply - maxTokens);
        if (balances[owner] >= totalSupply - minTokens) {
            // min token sale not reached, refunding
            for(uint i=0; i<keys.length; i++) {
                address client = keys[i];
                if (client != owner && balances[client] > 0) {
                    uint clientAmount = balances[client] * (10**18) / (10**decimals) / tokenToEtherRate;
                    balances[owner] += balances[client];
                    balances[client] = 0;
                    client.transfer(clientAmount);
                }
            }
        } else {
            // goal reached, sending all to owner
            owner.transfer(this.balance);
        }
    }

}
