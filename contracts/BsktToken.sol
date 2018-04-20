pragma solidity 0.4.21;


import "zeppelin-solidity/contracts/ReentrancyGuard.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


library AddressArrayUtils {

    /// @return Returns index and ok for the first occurrence starting from
    /// index 0
    function index(address[] addresses, address a)
        internal pure returns (uint, bool)
    {
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == a) {
                return (i, true);
            }
        }
        return (0, false);
    }

}


/// @title BsktToken
/// @notice Bskt tokens are transferable, and can be created and redeemed by
/// anyone. To create, a user must approve the contract to move the underlying
/// tokens, then call `create`.
/// @author Cryptofin
contract BsktToken is StandardToken, DetailedERC20, Pausable, ReentrancyGuard {
    using SafeMath for uint256;
    using AddressArrayUtils for address[];

    struct TokenInfo {
        address addr;
        uint256 quantity;
    }
    uint256 public creationUnit;
    TokenInfo[] public tokens;

    event Create(address indexed creator, uint256 amount);
    event Redeem(address indexed redeemer, uint256 amount, address[] skippedTokens);

    /// @notice Requires value to be divisible by creationUnit
    /// @param value Number to be checked
    modifier requireMultiple(uint256 value) {
        require((value % creationUnit) == 0);
        _;
    }

    /// @notice Requires value to be non-zero
    /// @param value Number to be checked
    modifier requireNonZero(uint256 value) {
        require(value > 0);
        _;
    }

    /// @notice Initializes contract with a list of ERC20 token addresses and
    /// corresponding minimum number of units required for a creation unit
    /// @param addresses Addresses of the underlying ERC20 token contracts
    /// @param quantities Number of token base units required per creation unit
    /// @param _creationUnit Number of base units per creation unit
    function BsktToken(
        address[] addresses,
        uint256[] quantities,
        uint256 _creationUnit,
        string _name,
        string _symbol
    ) DetailedERC20(_name, _symbol, 18) public {
        require(addresses.length > 0);
        require(addresses.length == quantities.length);
        require(_creationUnit >= 1);

        for (uint256 i = 0; i < addresses.length; i++) {
            tokens.push(TokenInfo({
                addr: addresses[i],
                quantity: quantities[i]
            }));
        }

        creationUnit = _creationUnit;
        name = _name;
        symbol = _symbol;
    }

    /// @notice Creates Bskt tokens in exchange for underlying tokens. Before
    /// calling, underlying tokens must be approved to be moved by the Bskt
    /// contract. The number of approved tokens required depends on baseUnits.
    /// @dev If any underlying tokens' `transferFrom` fails (eg. the token is
    /// frozen), create will no longer work. At this point a token upgrade will
    /// be necessary.
    /// @param baseUnits Number of base units to create. Must be a multiple of
    /// creationUnit.
    function create(uint256 baseUnits)
        external
        whenNotPaused()
        requireNonZero(baseUnits)
        requireMultiple(baseUnits)
    {
        // Check overflow
        require((totalSupply_ + baseUnits) > totalSupply_);

        for (uint256 i = 0; i < tokens.length; i++) {
            TokenInfo memory token = tokens[i];
            ERC20 erc20 = ERC20(token.addr);
            uint256 amount = baseUnits.div(creationUnit).mul(token.quantity);
            require(erc20.transferFrom(msg.sender, address(this), amount));
        }

        mint(msg.sender, baseUnits);
        emit Create(msg.sender, baseUnits);
    }

    /// @notice Redeems Bskt tokens in exchange for underlying tokens
    /// @param baseUnits Number of base units to redeem. Must be a multiple of
    /// creationUnit.
    /// @param tokensToSkip Underlying token addresses to skip redemption for.
    /// Intended to be used to skip frozen or broken tokens which would prevent
    /// all underlying tokens from being withdrawn due to a revert. Skipped
    /// tokens are left in the Bskt contract and are unclaimable.
    function redeem(uint256 baseUnits, address[] tokensToSkip)
        external
        requireNonZero(baseUnits)
        requireMultiple(baseUnits)
    {
        require(baseUnits <= totalSupply_);
        require(baseUnits <= balances[msg.sender]);
        require(tokensToSkip.length <= tokens.length);
        // Total supply check not required since a user would have to have
        // balance greater than the total supply

        // Burn before to prevent re-entrancy
        burn(msg.sender, baseUnits);

        for (uint256 i = 0; i < tokens.length; i++) {
            TokenInfo memory token = tokens[i];
            ERC20 erc20 = ERC20(token.addr);
            uint256 index;
            bool ok;
            (index, ok) = tokensToSkip.index(token.addr);
            if (ok) {
                continue;
            }
            uint256 amount = baseUnits.div(creationUnit).mul(token.quantity);
            require(erc20.transfer(msg.sender, amount));
        }
        emit Redeem(msg.sender, baseUnits, tokensToSkip);
    }

    /// @return addresses Underlying token addresses
    function tokenAddresses() external view returns (address[]){
        address[] memory addresses = new address[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            addresses[i] = tokens[i].addr;
        }
        return addresses;
    }

    /// @return quantities Number of token base units required per creation unit
    function tokenQuantities() external view returns (uint256[]){
        uint256[] memory quantities = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            quantities[i] = tokens[i].quantity;
        }
        return quantities;
    }

    // @dev Mints new Bskt tokens
    // @param to Address to mint to
    // @param amount Amount to mint
    // @return ok Whether the operation was successful
    function mint(address to, uint256 amount) internal returns (bool) {
        totalSupply_ = totalSupply_.add(amount);
        balances[to] = balances[to].add(amount);
        emit Transfer(address(0), to, amount);
        return true;
    }

    // @dev Burns Bskt tokens
    // @param from Address to burn from
    // @param amount Amount to burn
    // @return ok Whether the operation was successful
    function burn(address from, uint256 amount) internal returns (bool) {
        totalSupply_ = totalSupply_.sub(amount);
        balances[from] = balances[from].sub(amount);
        emit Transfer(from, address(0), amount);
        return true;
    }

    // @notice Look up token quantity and whether token exists
    // @param token Token address to look up
    // @return (quantity, ok) Units of underlying token, and whether the
    // token was found
    function getQuantity(address token) internal view returns (uint256, bool) {
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i].addr == token) {
                return (tokens[i].quantity, true);
            }
        }
        return (0, false);
    }

    /// @notice Owner: Withdraw excess funds which don't belong to Bskt Token
    /// holders
    /// @param token ERC20 token address to withdraw
    function withdrawExcessToken(address token)
        external
        onlyOwner
        nonReentrant
    {
        ERC20 erc20 = ERC20(token);
        uint256 withdrawAmount;
        uint256 amountOwned = erc20.balanceOf(address(this));
        uint256 quantity;
        bool ok;
        (quantity, ok) = getQuantity(token);
        if (ok) {
            withdrawAmount = amountOwned.sub(
                totalSupply_.div(creationUnit).mul(quantity)
            );
        } else {
            withdrawAmount = amountOwned;
        }
        require(erc20.transfer(owner, withdrawAmount));
    }

    /// @dev Prevent Bskt tokens from being sent to the Bskt contract
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(this));
        return super.transfer(_to, _value);
    }

    /// @dev Prevent Bskt tokens from being sent to the Bskt contract
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(this));
        return super.transferFrom(_from, _to, _value);
    }

}
