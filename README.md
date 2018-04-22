# Bskt

Bskt is a generic smart contract that creates decentralized token portfolios. Bskt facilitates the bundling and unbundling of a collection of ERC20 tokens in exchange for a new ERC20 token. Owners of the new token have a direct claim on the underlying tokens. Unlike traditional funds, custody is held by the smart contract.

These new tokens can be created by anyone who surrenders the underlying tokens and redeemed by anyone who owns issued tokens. Bskt allows investors to diversify their exposure to tokens in the Ethereum ecosystem without adding custody risk.

See the [whitepaper](https://github.com/cryptofinlabs/bskt-whitepaper) for more details.

## Usage
The steps for creating and redeeming Bskts are outlined here. A dapp which abstracts most of this away will be available here.

### Create
- Determine how many Bskt tokens to create
- Acquire the underlying tokens tokens (usually bought on exchanges)
- Call the ERC20 `approve` function for each underlying token, allowing the Bskt to access the appropriate amount of each token
- Call the Bskt's create function
  - The Bskt contract uses the ERC20 `transferFrom` function which then mints Bskt tokens for the creator

### Redeem
- Call the Bskt's redeem function
  - The Bskt contract burns the tokens and uses the ERC20 `transfer` function to transfer underlying tokens to the redeemer

## Documentation
The main functions provided in this contract are detailed below.

#### `BsktToken(address[] addresses, uint256[] quantities, uint256 _creationUnit, string _name, string _symbol)`
Initializes contract with a list of ERC20 token addresses and corresponding minimum number of units required for a creation unit.

#### `create(uint256 baseUnits)`
Creates Bskt tokens in exchange for underlying tokens. Before calling, underlying tokens must be approved to be moved by the Bskt Token contract. The number of approved tokens required depends on baseUnits. The `baseUnits` must be a multiple of the `creationUnit`.

#### `redeem(uint256 baseUnits, address[] tokensToSkip)`
Redeems Bskt tokens in return for underlying tokens. The `baseUnits` must be a multiple of the `creationUnit`.

## Development

### Set up
- Run:
  ```
  # git clone
  npm run bootstrap
  ```
- Create a `config/secrets.json` file. The `config-examples/secrets.example.json` file is provided for reference.

### Test
    npm run test:js
    npm run test:sol
    npm run test:e2e

### Deploy (beta)
- Create a `config/deploy-config.js` file. The `config-examples/deploy-config.example.js` file is provided for reference.
    truffle migrate --network <network>

### Contact
For questions, contact us hi@cryptofin.io
