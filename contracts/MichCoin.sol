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
    address owner;

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;
    address[] keys;

    function MichCoin(uint _tokenCount, uint _decimals, uint _tokenToEtherRate, uint _durationInSec, uint _minTokenCount, uint _maxTokenCount) {
        tokenToEtherRate = _tokenToEtherRate;
        decimals = _decimals;
        minTokens = _minTokenCount*(10**decimals);
        maxTokens = _maxTokenCount*(10**decimals);
        totalSupply = _tokenCount*(10**decimals);
        owner = msg.sender;
        balances[owner] = totalSupply;
        startTime = now;
        durationTime = _durationInSec;
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
        uint tokenAmount = weiToToken(msg.value);

        require(now - startTime < durationTime);
        require(balances[owner] - tokenAmount >= totalSupply - maxTokens);
        require(balances[msg.sender] + tokenAmount > balances[msg.sender]);

        if (balances[msg.sender] == 0) {
            keys.push(msg.sender);
        }
        balances[owner] -= tokenAmount;
        balances[msg.sender] += tokenAmount;
    }

    function withdraw() {
        require(now - startTime > durationTime || balances[owner] <= totalSupply - maxTokens);
        if (balances[owner] >= totalSupply - minTokens) {
            // min token sale not reached, refunding
            for(uint i=0; i<keys.length; i++) {
                address client = keys[i];
                if (client != owner && balances[client] > 0) {
                    uint clientAmount = tokenToWei(balances[client]);
                    balances[owner] += balances[client];
                    balances[client] = 0;
                    client.transfer(clientAmount);
                }
            }
        } else {
            // goal reached, sending all to owner
            if (this.balance > 0) {
                owner.transfer(this.balance);
            }
        }
    }

    function withdraw2() {
        require(now - startTime > durationTime || balances[owner] <= totalSupply - maxTokens);
        if (balances[owner] >= totalSupply - minTokens) {
            // min token sale not reached, refunding
            address client = msg.sender;
            if (client != owner && balances[client] > 0) {
                uint clientAmount = tokenToWei(balances[client]);
                balances[owner] += balances[client];
                balances[client] = 0;
                client.transfer(clientAmount);
            }
        } else {
            // goal reached, sending all to owner
            if (this.balance > 0) {
                owner.transfer(this.balance);
            }
        }
    }

    function tokenToWei(uint _tokens) constant returns (uint) {
        return _tokens * (10**18) / tokenToEtherRate / (10**decimals);
    }

    function weiToToken(uint _weis) constant returns (uint) {
        return tokenToEtherRate * _weis * (10**decimals) / (10**18);
    }

}
