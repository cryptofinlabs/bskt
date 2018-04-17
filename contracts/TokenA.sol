pragma solidity 0.4.21;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract TokenA is StandardToken {
    string public name = "TokenA";
    string public symbol = "TA";
    uint8 public decimals = 2;
    uint constant public INITIAL_SUPPLY = 13000;

    function TokenA() public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}
