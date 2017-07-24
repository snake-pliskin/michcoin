pragma solidity ^0.4.4;
import './ERC20.sol';

contract MichCoin is ERC20 {

    string public constant name = "Mich Coin";
    string public constant symbol = "MI4";
    uint8 public constant decimals = 2;
    uint private exchangeRate = 2;
    uint public startTime;
    uint public durationTime;
    address owner;

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    function MichCoin() {
        totalSupply = 50000000;
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
        startTime = now;
        durationTime = 5 minutes;
    }

    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }

    function transfer(address _to, uint _value) returns (bool success) {
        if (balances[msg.sender] < _value || _value == 0 || balances[_to] + _value < balances[_to]) {
            return false;
        }
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint _value) returns (bool success) {
        if (balances[msg.sender] < _value || _value == 0 || balances[_to] + _value < balances[_to] || allowed[_from][_to] < _value) {
            return false;
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
        uint tokenAmount = msg.value*exchangeRate;
        if (now - startTime > durationTime || balances[owner] - tokenAmount < 0 || balances[msg.sender] + tokenAmount < balances[msg.sender]) {
            throw;
        }
        balances[owner] -= tokenAmount;
        balances[msg.sender] += tokenAmount;
    }
}
