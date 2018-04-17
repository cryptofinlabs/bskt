pragma solidity 0.4.21;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract TokenB is StandardToken {
    string public name = "TokenB";
    string public symbol = "TB";
    uint8 public decimals = 2;
    uint constant public INITIAL_SUPPLY = 13000;

    function TokenB() public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}
