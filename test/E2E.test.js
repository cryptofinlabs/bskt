const P = require('bluebird');
const glob = require('glob');

const TokenA = artifacts.require('TokenA');
const BsktToken = artifacts.require('BsktToken');

const {ETW_DECIMALS} = require('./constants');
const {toBU} = require('./utils');

const provider = new web3.providers.HttpProvider("http://localhost:7545");
const globPromise = P.promisify(glob);

const CREATION_UNIT = 10 ** 16;
const CREATION_UNITS_PER_BSKT = (10 ** ETW_DECIMALS) / CREATION_UNIT;

let mockToken;

function conditionalIt(title, test) {
  let shouldSkip = true;
  if (process.env.TEST_ENV === 'e2e') {
    shouldSkip = false;
  }
  return shouldSkip ? it.skip(title, test) : it(title, test);
}

/**
 * Test balances and total supply for bskt contract, buyer and owner during creation process
 */
async function testCreationTokenState(bsktToken, underlyingToken, owner, buyer, contractName) {
  const initialContractBalance = await underlyingToken.balanceOf(bsktToken.address);
  const initialBuyerBalance = await underlyingToken.balanceOf(buyer);
  const initialTotalSupply = await bsktToken.totalSupply();
  assert.equal(initialContractBalance.toNumber(), 0, `contract should have no ${contractName}`);
  assert.equal(initialBuyerBalance.toNumber(), 100 * CREATION_UNITS_PER_BSKT, `buyer should have some ${contractName} token`);
  assert.equal(initialTotalSupply.toNumber(), 0, `Bskt contract should have 0 total supply after creation`);

  const txReceipt = await bsktToken.create(toBU(1), {from: buyer});

  const postCreateContractBalance = await underlyingToken.balanceOf(bsktToken.address);
  const postCreateBuyerBalance = await underlyingToken.balanceOf(buyer);
  const postCreateTotalSupply = await bsktToken.totalSupply();
  assert.equal(postCreateContractBalance.toNumber(), 100 * CREATION_UNITS_PER_BSKT, `contract should have 100 ${contractName}`);
  assert.equal(postCreateBuyerBalance.toNumber(), 0, `buyer should have no ${contractName} left`);
  assert.equal(postCreateTotalSupply.toNumber(), toBU(1), `Bskt contract should have correct supply after creation`);

  const bsktTokenBuyerBalance = await bsktToken.balanceOf(buyer);
  assert.equal(bsktTokenBuyerBalance.toNumber(), toBU(1), 'buyer should have correct Bskt token balance');
}

contract('E2E token testing', function([owner, buyer]) {
  let bsktToken, underlyingTokensInstance;

  context('Bskt with individual tokens', function() {
    before(async function () {
      mockToken = await TokenA.new({from: owner});
    });
    conditionalIt('should initialize Bskt with ZRXToken successfully', async function() {
      const contractName = 'ZRXToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with AElfToken successfully', async function() {
      const contractName = 'AElfToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with AEToken successfully', async function() {
      const contractName = 'AEToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with RepToken successfully', async function() {
      const contractName = 'RepToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with BAToken successfully', async function() {
      const contractName = 'BAToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with BNB successfully', async function() {
      const contractName = 'BNB';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with Dragon successfully', async function() {
      const contractName = 'Dragon';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with EOS successfully', async function() {
      const contractName = 'EOS';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with IcxToken successfully', async function() {
      const contractName = 'IcxToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with IOSToken successfully', async function() {
      const contractName = 'IOSToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with KyberNetworkCrystal successfully', async function() {
      const contractName = 'KyberNetworkCrystal';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with OMGToken successfully', async function() {
      const contractName = 'OMGToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with Populous successfully', async function() {
      const contractName = 'Populous';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with PowerLedger successfully', async function() {
      const contractName = 'PowerLedger';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with QASHToken successfully', async function() {
      const contractName = 'QASHToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with QTUM successfully', async function() {
      const contractName = 'HumanStandardToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with SNT successfully', async function() {
      const contractName = 'SNT';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with TronToken successfully', async function() {
      const contractName = 'TronToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with VEN successfully', async function() {
      const contractName = 'VEN';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with WaltonToken successfully', async function() {
      const contractName = 'WaltonToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with ZilliqaToken successfully', async function() {
      const contractName = 'ZilliqaToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with DigixDao successfully', async function() {
      const contractName = 'DigixDao';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with BytomToken successfully', async function() {
      const contractName = 'BytomToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with Revain successfully', async function() {
      const contractName = 'Revain';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize Bskt with Bibox Token successfully', async function() {
      const contractName = 'BIXToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
    conditionalIt('should initialize ETF with ADXToken successfully', async function() {
      const contractName = 'ADXToken';
      const result = await initializeSingleContract(contractName, owner, buyer);
      await testCreationTokenState(result.bsktToken, result.tokenInstances[0], owner, buyer, contractName);
    });
  });

  context('Bskt with 20 token portfolio', async function() {
    const tokensInfo = [
      {
        name: 'EOS',
        units: 15459501974133
      },
      {
        name: 'TronToken',
        units: 1459
      },
      {
        name: 'VEN',
        units: 10550407423850
      },
      {
        name: 'IcxToken',
        units: 8567415065480
      },
      {
        name: 'Populous',
        units: 82
      },
      {
        name: 'OMGToken',
        units: 2265069167986
      },
      {
        name: 'BNB',
        units: 2197844246343
      },
      {
        name: 'DigixDao',
        units: 44
      },
      {
        name: 'ZRXToken',
        units: 11419786553677
      },
      {
        name: 'RepToken',
        units: 244170152636
      },
      {
        name: 'WaltonToken',
        units: 552672567904
      },
      {
        name: 'BytomToken',
        units: 2191
      },
      {
        name: 'SNT',
        units: 77035430289520
      },
      {
        name: 'IOStoken',
        units: 150811070934861
      },
      {
        name: 'ZilliqaToken',
        units: 144531945
      },
      {
        name: 'KyberNetworkCrystal',
        units: 2977382061046
      },
      {
        name: 'BAToken',
        units: 22197314735194
      },
      {
        name: 'AElfToken',
        units: 5549330107047
      },
      {
        name: 'QASHToken',
        units: 8
      },
      {
        name: 'ADXToken',
        units: 2
      }
    ];

    before(async function () {
      mockToken = await TokenA.new({from: owner});
    });
    conditionalIt('should create then redeem Bskt with all tokens', async function() {
      // Prepare tokens
      const contractNames = tokensInfo.map(token => token.name);
      const quantity = tokensInfo.map(token => token.units);
      const result = await initializePortfolioContract(
        contractNames,
        quantity,
        owner,
        buyer
      );
      const bsktToken = result.bsktToken;
      const underlyingTokens = result.tokenInstances;

      // Test initial values
      for (let i = 0; i < underlyingTokens.length; i++) {
        const initialContractBalance = await underlyingTokens[i].balanceOf(bsktToken.address);
        const initialBuyerBalance = await underlyingTokens[i].balanceOf(buyer);
        assert.equal(initialContractBalance.toNumber(), 0, `contract should have no ${contractNames[i]}`);
        assert.equal(initialBuyerBalance.toNumber(), quantity[i] * CREATION_UNITS_PER_BSKT, `buyer should have some ${contractNames[i]} token`);
      }

      const initialTotalSupply = await bsktToken.totalSupply();
      assert.equal(initialTotalSupply.toNumber(), 0, `Bskt contract should have 0 total supply after creation`);

      // Create Bskt
      const createReceipt = await bsktToken.create(web3.toWei(1, 'ether'), {from: buyer});
      // Test post-creation values
      for (let i = 0; i < underlyingTokens.length; i++) {
        const postCreateContractBalance = await underlyingTokens[i].balanceOf(bsktToken.address);
        const postCreateBuyerBalance = await underlyingTokens[i].balanceOf(buyer);
        assert.equal(postCreateContractBalance.toNumber(), quantity[i] * CREATION_UNITS_PER_BSKT, `contract should have correct amount of ${contractNames[i]} in 1 Bskt`);
        assert.equal(postCreateBuyerBalance.toNumber(), 0, `buyer should have no ${contractNames[i]} left`);
      }
      const postCreateTotalSupply = await bsktToken.totalSupply();
      const bsktTokenBuyerBalancePostCreate = await bsktToken.balanceOf(buyer);
      assert.equal(postCreateTotalSupply.toNumber(), toBU(1), `Bskt contract should have correct supply after creation`);
      assert.equal(bsktTokenBuyerBalancePostCreate.toNumber(), toBU(1), 'buyer should have correct Bskt token balance');

      // Redeem Bskt
      const redeemReceipt = await bsktToken.redeem(toBU(1), [], {from: buyer});

      // Test post-redemption values
      for (let i = 0; i < underlyingTokens.length; i++) {
        const postRedeemContractBalance = await underlyingTokens[i].balanceOf(bsktToken.address);
        const postRedeemBuyerBalance = await underlyingTokens[i].balanceOf(buyer);
        assert.equal(postRedeemContractBalance.toNumber(), 0, `contract should have no ${contractNames[i]} left`);
        assert.equal(postRedeemBuyerBalance.toNumber(), quantity[i] * CREATION_UNITS_PER_BSKT, `buyer should have the same ${contractNames[i]} balance initially`);
      }
      const postRedeemTotalSupply = await bsktToken.totalSupply();
      const bsktTokenBuyerBalancePostRedeem = await bsktToken.balanceOf(buyer);

      assert.equal(postRedeemTotalSupply.toNumber(), 0, `Bskt contract should have no token after redemption`);
      assert.equal(bsktTokenBuyerBalancePostRedeem.toNumber(), 0, 'buyer should have no Bskt token');
    });
  });
});


async function initializePortfolioContract(contractNames, quantity, owner, buyer) {
  try {
    const deployPromises = contractNames.map((contractName) => {
      return deployUnderlyingToken(owner, contractName);
    });
    const instances = await P.all(deployPromises);
    const result = await setupBsktToken(owner, buyer, instances, quantity, contractNames);
    return result;
  } catch(e) {
    assert.ifError(e);
  }
}

async function initializeSingleContract(contractName, owner, buyer) {
  try {
    const instance = await deployUnderlyingToken(owner, contractName);
    const result = await setupBsktToken(owner, buyer, [instance], null, [contractName]);
    return result;
  } catch(e) {
    assert.ifError(e);
  }
}

async function deployUnderlyingToken(owner, contractName) {
  const contract = artifacts.require(contractName);
  const argsFile = await globPromise(`**/underlying-token-contracts/*/${contractName}.json`, {});
  const contractArgs = require(`../${argsFile[0]}`);
  const argsValue = contractArgs.values.slice();
  argsValue.push({from: owner});
  contract.setProvider(provider);
  try {
    const preprocessedArgs =  overrideConstructorArgs(contractName, argsValue, mockToken, owner);
    const instance = await contract.new.apply(contract, preprocessedArgs);
    return instance;
  } catch(e) {
    console.log(e);
  }
}

/**
 * Setup Bskt token with an underlying token instance
 * @param  {address} owner          Address of contract owner
 * @param  {address} buyer          Address of buyer
 * @param  {[ContractInstance]} tokenInstances Instances of deployed underlying token contracts
 * @param  {[string]} tokenCountList Count of Each token per Bskt
 * @param  {[string]} contractNames   Name of deployed contract
 * @return {}                Bskt token instance and deployed underlying token instance
 */
async function setupBsktToken(owner, buyer, tokenInstances, tokenCountList, contractNames) {
  if (!tokenCountList) {
    tokenCountList = Array.from({length: tokenInstances.length}, () => 100);
  }
  const bsktToken = await BsktToken.new(
    tokenInstances.map(token => token.address),
    tokenCountList,
    CREATION_UNIT,
    'Basket',
    'BSK',
    {from: owner}
  );

  await prepUnderlyingTokensForTransfer(owner, buyer, tokenInstances, tokenCountList, contractNames, bsktToken);

  return {
    bsktToken,
    tokenInstances
  };
}

/**
 * Enable buyer transfering tokens to bskt contract
 * @param  {address} owner          Owner's address
 * @param  {address} buyer          Buyer's address
 * @param  {[ContractInstance]} tokenInstances Deployed token contract instances
 * @param  {[string]} contractNames   Token Contract Name
 * @param  {ContractInstance} bsktToken   Deployed bskt token contract instance
 */
async function prepUnderlyingTokensForTransfer(owner, buyer, tokenInstances, tokenCountList, contractNames, bsktToken) {
  // cannot do await properly in a forEach loop
  for (let i = 0; i < tokenInstances.length; i++) {
    try {
      const tokenUnit = tokenCountList[i];
      const unitsToTransfer = tokenUnit * CREATION_UNITS_PER_BSKT;
      const contractName = contractNames[i];

      switch(contractName) {
        case 'AElfToken':
          await tokenInstances[i].approveMintTokens(buyer, unitsToTransfer);
          await tokenInstances[i].mintTokens(buyer);
          break;
        case 'AEToken':
          await tokenInstances[i].prefill([buyer], [unitsToTransfer], {from: owner});
          await tokenInstances[i].launch({from: owner});
          break;
        case 'IcxToken':
          await tokenInstances[i].enableTokenTransfer();
          await tokenInstances[i].transfer(buyer, unitsToTransfer);
          break;
        case 'VEN':
          await tokenInstances[i].mint(buyer, unitsToTransfer, false, 44444);
          await tokenInstances[i].seal();
          break;
        case 'ZilliqaToken':
          await tokenInstances[i].pause(false, false);
          await tokenInstances[i].transfer(buyer, unitsToTransfer);
          break;
        case 'Populous':
          await tokenInstances[i].setReleaseAgent(owner);
          await tokenInstances[i].releaseTokenTransfer();
          await tokenInstances[i].transfer(buyer, unitsToTransfer);
          break;
        case 'RepToken':
          await tokenInstances[i].unpause({from: owner});
          await tokenInstances[i].transfer(buyer, unitsToTransfer);
          break;
        case 'EOS':
          await tokenInstances[i].mint(unitsToTransfer, {from: buyer});
          break;
        case 'OMGToken':
          await tokenInstances[i].mint(buyer, unitsToTransfer);
          break;
        case 'SNT':
          await tokenInstances[i].generateTokens(buyer, unitsToTransfer);
          break;
        case 'DigixDao':
          await tokenInstances[i].mint(buyer, unitsToTransfer);
          break;
        default:
          await tokenInstances[i].transfer(buyer, unitsToTransfer);
          break;
      }
      await tokenInstances[i].approve(
        bsktToken.address,
        unitsToTransfer,
        {from: buyer}
      );
    } catch(e) {
      console.log(`Error with ${contractNames[i]}:`.red);
      console.log(e);
      throw(e);
    }
  }
}

/**
 * Custom logic to modify contract contrustor arguments for smoother initialization
 */
function overrideConstructorArgs(contractName, args, mockToken, owner) {
  switch(contractName) {
    case 'RepToken':
      args[0] = mockToken.address;
      args[1] = -1;
      args[2] = owner;
      return args;
    case 'IcxToken':
      args = [-1, mockToken.address]; // -1 is MAX_UINT
      break;
    case 'BAToken':
      args = ["0xac2fa512db158f44f5ee2fa5766ea7c282763cdb", owner, "3798640", "3963480"];
      break;
    case 'DigixDao':
    case'BIXToken':
    case 'TronToken':
      args = [owner];
      break;
  }
  return args;
}
