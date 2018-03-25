pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract TokenC is StandardToken {
    string public name = "TokenC";
    string public symbol = "TC";
    uint8 public decimals = 2;
    uint constant public INITIAL_SUPPLY = 13000;

    function TokenC() public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}
