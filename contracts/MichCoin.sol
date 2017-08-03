pragma solidity ^0.4.4;
import './ERC20.sol';

contract MichCoin is ERC20 {

    string public constant name = "Mich Coin";
    string public constant symbol = "MI4";
    uint public constant decimals = 8;

    uint public tokenToEtherRate;
    uint public startTime;
    uint public durationTime;
    uint public bonusDurationTime;
    uint public minTokens;
    uint public maxTokens;
    bool public frozen;

    address owner;
    address reserve;
    address main;

    mapping(address => uint256) balances;
    mapping(address => uint256) incomes;
    mapping(address => mapping(address => uint256)) allowed;
    address[] keys;

    function MichCoin(uint _tokenCount, uint _minTokenCount, uint _tokenToEtherRate, uint _durationInSec, uint _bonusDurationInSec, address _mainAddress, address _reserveAddress) {

        tokenToEtherRate = _tokenToEtherRate;
        totalSupply = _tokenCount*(10**decimals);
        minTokens = _minTokenCount*(10**decimals);
        maxTokens = totalSupply*85/100;

        owner = msg.sender;
        balances[this] = totalSupply;
        startTime = now;
        durationTime = _durationInSec;
        bonusDurationTime = _bonusDurationInSec;
        reserve = _reserveAddress;
        main = _mainAddress;
        frozen = false;
    }

    //modifiers

    modifier ownerOnly {
        require(msg.sender == owner);
        _;
    }

    modifier canFreeze {
        require(frozen == false);
        _;
    }

    //owner functions

    function freeze() ownerOnly {
        frozen = true;
    }

    function unfreeze() ownerOnly {
        frozen = false;
    }

    //erc20

    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }

    function transfer(address _to, uint _value) canFreeze returns (bool success) {
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

    function transferFrom(address _from, address _to, uint _value) canFreeze returns (bool success) {
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

    function approve(address _spender, uint _value) canFreeze returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint remaining) {
        return allowed[_owner][_spender];
    }

    //ether operations

    function () payable canFreeze {
        uint tokenAmount = weiToToken(msg.value);
        uint bonusAmount = 0;
        //add bonus token if bought on bonus period
        if (now - startTime < bonusDurationTime) {
            bonusAmount = tokenAmount / 10;
            tokenAmount += bonusAmount;
        }

        require(now - startTime < durationTime);
        require(balances[this] >= tokenAmount);
        require(balances[this] - tokenAmount >= totalSupply - maxTokens);
        require(balances[msg.sender] + tokenAmount > balances[msg.sender]);

        if (balances[msg.sender] == 0) {
            keys.push(msg.sender);
        }
        balances[this] -= tokenAmount;
        balances[msg.sender] += tokenAmount;
        incomes[msg.sender] += msg.value;
    }

    function withdraw() canFreeze {
        require(now - startTime > durationTime || balances[this] <= totalSupply - maxTokens);
        if (balances[this] >= totalSupply - minTokens) {
            // min token sale not reached, refunding
            for(uint i=0; i<keys.length; i++) {
                address client = keys[i];
                if (incomes[client] > 0) {
                    balances[client] = 0;
                    client.transfer(incomes[client]);
                    incomes[client] = 0;
                }
            }
            balances[this] = 0;
        } else {
            // goal reached, sending all eth to main
            if (this.balance > 0) {
                // calculting reserve tokens
                balances[reserve] = (totalSupply - balances[this]) * 15 / 85;
                balances[this] = 0;
                //sending eth to main address
                main.transfer(this.balance);
            }
        }
    }

    //utility

    function tokenToWei(uint _tokens) constant returns (uint) {
        return _tokens * (10**18) / tokenToEtherRate / (10**decimals);
    }

    function weiToToken(uint _weis) constant returns (uint) {
        return tokenToEtherRate * _weis * (10**decimals) / (10**18);
    }

}
