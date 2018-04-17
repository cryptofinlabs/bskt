pragma solidity 0.4.21;


import "truffle/Assert.sol";
import "../contracts/BsktToken.sol";
import "../contracts/TokenA.sol";


/// @dev Exposed version of BsktToken so that internal functions can be tested.
/// Internal functions are copied and renamed with the prefix `_`.
contract ExposedBsktToken is BsktToken {

    function ExposedBsktToken(address[] addresses, uint[] units, uint _creationUnit, string _name, string _symbol) BsktToken(addresses, units, _creationUnit, _name, _symbol) public {
    }

    function _getQuantity(address token) public returns (uint256, bool) {
        return getQuantity(token);
    }

    function _mint(address to, uint256 amount) public returns (bool) {
        return mint(to, amount);
    }

    function _burn(address from, uint256 amount) public returns (bool) {
        return burn(from, amount);
    }

}


contract TestBsktToken {

    ExposedBsktToken bskt;
    address account1 = address(0xDEAe3325A66EB9B9Ea83b404dC10FD7c2946Ece9);

    /// @dev beforeEach is causing an out of gas error, so using setup() instead for now
    function beforeEach() public {
    }

    /// @dev beforeEach isn't resetting state between tests, so using this for
    /// tests that require a clean instance
    /// @return bskt Exposed version of the Bskt Token contract
    function setup() public returns (ExposedBsktToken) {
        ExposedBsktToken _bskt;
        address[] storage addresses;
        uint[] storage units;
        addresses.push(address(0x1));
        addresses.push(address(0x2));
        addresses.push(address(0x3));
        units.push(1);
        units.push(2);
        units.push(3);
        _bskt = new ExposedBsktToken(
            addresses,
            units,
            1,
            'Basket',
            'BSK'
        );
        return _bskt;
    }

    function testGetQuantity() public {
        ExposedBsktToken _bskt = setup();
        address query = address(0x2);
        uint unit;
        bool ok;
        (unit, ok) = _bskt._getQuantity(query);
        Assert.equal(ok, true, "should be ok");
        Assert.equal(unit, 2, "should get the correct token info unit");
    }

    function testGetQuantityFail() public {
        ExposedBsktToken _bskt = setup();
        address query = address(0x0);
        uint unit;
        bool ok;
        (unit, ok) = _bskt._getQuantity(query);
        Assert.equal(ok, false, "should not be ok");
        Assert.equal(unit, 0, "should be 0");
    }

    function testMint() public {
        ExposedBsktToken _bskt = setup();
        uint amount = 1000;
        bool ok = _bskt._mint(account1, amount);
        Assert.equal(ok, true, "ok");
        Assert.equal(_bskt.balanceOf(account1), amount, "account balance should be equal to amount");
        Assert.equal(_bskt.totalSupply(), amount, "total supply should be equal to amount");
    }

    function testBurn() public {
        ExposedBsktToken _bskt = setup();
        uint amountToMint = 1000;
        bool ok1 = _bskt._mint(account1, amountToMint);
        Assert.equal(ok1, true, "ok");
        Assert.equal(_bskt.balanceOf(account1), amountToMint, "account balance should be equal to amountToMint");
        Assert.equal(_bskt.totalSupply(), amountToMint, "total supply should be equal to amountToMint");

        uint amountToBurn = 500;
        bool ok2 = _bskt._burn(account1, amountToBurn);
        Assert.equal(ok2, true, "ok");
        Assert.equal(_bskt.balanceOf(account1), amountToMint - amountToBurn, "account balance should be equal");
        Assert.equal(_bskt.totalSupply(), amountToMint - amountToBurn, "total supply should be equal");
    }

}
