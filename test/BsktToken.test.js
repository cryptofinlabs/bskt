const P = require('bluebird');
const BsktToken = artifacts.require('BsktToken');
const TokenA = artifacts.require('TokenA');
const TokenB = artifacts.require('TokenB');
const TokenC = artifacts.require('TokenC');

const assertRevert = require('./helpers/assertRevert.js');
const BigNumber = web3.BigNumber;
const NUM_UNITS = 100;

function conditionalIt(title, test) {
  let shouldSkip = false;
  if (process.env.TEST_ENV === 'e2e') {
    shouldSkip = true;
  }
  return shouldSkip ? it.skip(title, test) : it(title, test);
}

contract('BsktToken', function([owner, buyer1, buyer2, bskt20Buyer]) {

  context('With 2 underlying tokens', function() {
    let bsktToken, tokenA, tokenB;

    beforeEach(async function () {
      const result = await setupBsktToken(owner, buyer1, [TokenA, TokenB], [1, 2], 2);
      bsktToken = result.bsktToken;
      tokenA = result.underlyingTokensInstance[0];
      tokenB = result.underlyingTokensInstance[1];
    });

    conditionalIt('should correctly set values on init', async function test() {
      const tokenAddresses = await bsktToken.tokenAddresses();
      const tokenQuantities = await bsktToken.tokenQuantities();
      const contractOwner = await bsktToken.owner.call();
      const creationUnit = await bsktToken.creationUnit();
      const name = await bsktToken.name.call();
      const symbol = await bsktToken.symbol.call();

      assert.deepEqual(tokenAddresses.valueOf(), [
        tokenA.address,
        tokenB.address
      ], 'should correctly init addresses');
      assert.deepEqual(tokenQuantities, [new BigNumber(1), new BigNumber(2)], 'should correctly init weights');
      assert.equal(contractOwner, owner, 'should correctly init owner');
      assert.equal(creationUnit.toNumber(), 2, 'should correctly init creationUnit');
      assert.equal(name, 'Basket', 'should correctly init name');
      assert.equal(symbol, 'BSK', 'should correctly init symbol')
    });

    conditionalIt('should have 0 supply on init', async function() {
      const amount = await bsktToken.totalSupply();
      assert.equal(amount.toNumber(), 0, 'should be 0');
    });

    conditionalIt('should initialized external tokens correctly', async function() {
      const tokenAAmount = await tokenA.balanceOf.call(buyer1);
      const tokenBAmount = await tokenB.balanceOf.call(buyer1);
      assert.equal(tokenAAmount.toNumber(), 50, 'incorrect tokenA balance for buyer1');
      assert.equal(tokenBAmount.toNumber(), 100, 'incorrect tokenB balance for buyer1');

      const tokenARemaining = await tokenA.balanceOf.call(owner);
      const tokenBRemaining = await tokenB.balanceOf.call(owner);
      assert.equal(tokenARemaining.toNumber(), 12950, 'incorrect remaining tokenA supply for owner');
      assert.equal(tokenBRemaining.toNumber(), 12900, 'incorrect remaining tokenB supply for owner');
    });

    conditionalIt('should not initialize if contract address input is invalid', async function() {
      try {
        await BsktToken.new([], [1, 2], 2, 'Basket', 'BSK', {from: owner});
        assert.fail(false, 'contract address input should not be correct');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not initialize if token amounts input are invalid', async function() {
      try {
        await BsktToken.new([
          tokenA.address,
          tokenB.address
        ], [], 2, 'Basket', 'BSK', {from: owner});
        assert.fail(false, 'token amounts input should not be correct');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not initialize if addresses length aren\'t equal to token amount length', async function() {
      try {
        await BsktToken.new([
          tokenA.address,
          tokenB.address
        ], [1], 2, 'Basket', 'BSK', {from: owner});
        assert.fail(false, 'token amounts should not be equal to number of addresses');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not initialize if creationUnit amount is invalid', async function() {
      try {
        await BsktToken.new([
          tokenA.address,
          tokenB.address
        ], [1, 2], 0, 'Basket', 'BSK', {from: owner});
        assert.fail(false, 'creationUnit amount should be wrong');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should create bskt tokens for buyer in a happy case', async function test() {
      const txReceipt = await bsktToken.create(100, {from: buyer1});

      //assert.equal(txReceipt.logs.length, 4, 'logs should be created');
      assert.equal(txReceipt.logs[0].event, 'Transfer', 'did not log transfer event');
      assert.equal(txReceipt.logs[1].event, 'Transfer', 'did not log transfer event');
      assert.equal(txReceipt.logs[2].event, 'Transfer', 'did not log transfer event');
      assert.equal(txReceipt.logs[3].event, 'Create', 'did not log create event');

      const contractTokenABalance = await tokenA.balanceOf(bsktToken.address);
      const contractTokenBBalance = await tokenB.balanceOf(bsktToken.address);
      const buyer1TokenABalance = await tokenA.balanceOf(buyer1);
      const buyer1TokenBBalance = await tokenB.balanceOf(buyer1);

      assert.equal(contractTokenABalance.toNumber(), 50, 'contract should have 100 token A');
      assert.equal(contractTokenBBalance.toNumber(), 100, 'contract should have 200 token B');
      assert.equal(buyer1TokenABalance.toNumber(), 0, 'buyer should have no token A left');
      assert.equal(buyer1TokenBBalance.toNumber(), 0, 'buyer should have no token B left');

      const buyer1Balance = await bsktToken.balanceOf(buyer1);
      assert.equal(buyer1Balance.toNumber(), 100, 'should have correct buyer1 balance');
    });

    conditionalIt('should not create any Bskt when creation amount less than 1', async function test() {
      try {
        await bsktToken.create(0, {from: buyer1});
        assert.fail(false, 'should not allow creation of anything less than 1');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not create any Bskt when there\'s an overflow', async function test() {
      try {
        const result = await setupBsktToken(owner, buyer1, [TokenA, TokenB], [1, 2], 1);
        const lowCreationUnitToken = result.bsktToken;

        await lowCreationUnitToken.create(2, {from: buyer1});
        await lowCreationUnitToken.create(-1, {from: buyer1});
        assert.fail(false, 'should not allow creation when overflow');

      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not create any Bskt when there\'s not enough allowance', async function test() {
      try {
        // Remove approval amount
        await tokenA.approve(bsktToken.address, 0, {from: buyer1});

        await bsktToken.create(100, {from: buyer1});

        assert.fail(false, 'should not allow creation when buyer does not approve bskt contract');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not create if units is not divisible by creationUnit', async function() {
      try {
        await bsktToken.create(3, {from: buyer1});
        assert.fail(false, 'should not allow creation of any Bskt token amount not divisible by 2');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not create any Bskt when contract is paused', async function test() {
      try {
        await bsktToken.pause({from: owner});
        await bsktToken.create(100, {from: buyer1});
        assert.fail(false, 'should not allow creation when contract is paused');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should create Bskt when contract is unpaused', async function test() {
      try {
        await bsktToken.pause({from: owner});
        await bsktToken.unpause({from: owner});
        await bsktToken.create(100, {from: buyer1});
      } catch(e) {
        assert.fail('should not throw any error');
      }
    });

    conditionalIt('should redeem bskt tokens for buyer in a happy case', async function test() {
      await bsktToken.create(100, {from: buyer1});

      const tokenAPreBalance = await tokenA.balanceOf.call(buyer1);
      const tokenBPreBalance = await tokenB.balanceOf.call(buyer1);
      const totalSupplyPre = await bsktToken.totalSupply();

      const txReceipt = await bsktToken.redeem(100, [], {from: buyer1});
      const tokenAPostBalance = await tokenA.balanceOf.call(buyer1);
      const tokenBPostBalance = await tokenB.balanceOf.call(buyer1);
      const totalSupplyPost = await bsktToken.totalSupply();
      const contractTokenABalance = await tokenA.balanceOf.call(bsktToken.address);
      const contractTokenBBalance = await tokenB.balanceOf.call(bsktToken.address);

      //assert.equal(txReceipt.logs.length, 4, 'logs should be created');
      assert.equal(txReceipt.logs[0].event, 'Transfer', 'did not log transfer event');
      assert.equal(txReceipt.logs[1].event, 'Transfer', 'did not log transfer event');
      assert.equal(txReceipt.logs[2].event, 'Transfer', 'did not log transfer event');
      assert.equal(txReceipt.logs[3].event, 'Redeem', 'did not log redeem event');

      assert.equal(tokenAPostBalance - tokenAPreBalance, 50, 'buyer1 did not redeem tokenA balance correctly');
      assert.equal(tokenBPostBalance - tokenBPreBalance, 100, 'buyer1 did not redeem tokenB balance correctly');
      assert.equal(totalSupplyPre.toNumber(), 100, 'total supply adjusted properly');
      assert.equal(totalSupplyPost.toNumber(), 0, 'total supply adjusted properly');
      assert.equal(contractTokenABalance, 0, 'contract should have no token A left');
      assert.equal(contractTokenBBalance, 0, 'contract should have no token B left');
    });

    conditionalIt('should not redeem any Bskt when redemption amount is more than supply', async function test() {
      try {
        await bsktToken.redeem(1000, [], {from: buyer1});
        assert.fail(false, 'redemption amount is more than supply');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not redeem when sender doesn\'t have enough balance', async function test() {
      try {
        // Precreate some tokens to add to total supply
        await bsktToken.create(100, {from: buyer1});

        // Let a buyer that doesn't have any balance redeem the Bskt token
        await bsktToken.redeem(100, [], {from: buyer2});
        assert.fail(false, 'redemption amount is larger than buyer\'s balance');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not transfer Bskt tokens to Bskt contract', async function test() {
      try {
        await bsktToken.create(100, {from: buyer1});
        await bsktToken.transfer(bsktToken.address, 100, {from: buyer1});
        assert.fail(false, 'cannot transfer Bskt tokens to Bskt contract');
      } catch(e) {
        assertRevert(e);
      }
    });

    conditionalIt('should not transfer Bskt tokens to Bskt contract using transferFrom', async function test() {
      try {
        await bsktToken.create(100, {from: buyer1});
        await bsktToken.approve(buyer2, 100, {from: buyer1});
        await bsktToken.transferFrom(buyer1, bsktToken.address, 100, {from: buyer2});
        assert.fail(false, 'cannot transfer Bskt tokens to Bskt contract using transferFrom');
      } catch(e) {
        assertRevert(e);
      }
    });

  });

  context('With 20 underlying tokens', function () {
    let bskt20Token, tokenInstances, tokenCountList;

    beforeEach(async function () {
      const tokenList = Array.from({length: 20}, () => TokenA);
      tokenCountList = Array.from({length: 20}, () => 2);
      const result = await setupBsktToken(owner, bskt20Buyer, tokenList, tokenCountList, 1);
      bskt20Token = result.bsktToken;
      tokenInstances = result.underlyingTokensInstance;
    });

    conditionalIt('should create bskt tokens with 20 tokens for buyer', async function test() {
      const txReceipt = await bskt20Token.create(100, {from: bskt20Buyer});
      //assert.equal(txReceipt.logs.length, 22, 'logs should be created');

      const buyerBalance = await bskt20Token.balanceOf.call(bskt20Buyer);
      assert.equal(buyerBalance.toNumber(), 100, 'should have correct buyer balance');
    });

    conditionalIt('should not send any underlying tokens if tokens transfer fails mid way of creation', async function test() {
      const fifthToken = tokenInstances[4];
      await fifthToken.approve(bskt20Token.address, 0, {from: bskt20Buyer});
      const allowanceAmount = await fifthToken.allowance.call(bskt20Buyer, bskt20Token.address);

      assert.equal(allowanceAmount, 0, 'invalid allowance amount');
      try {
        await bskt20Token.create(200, {from: bskt20Buyer});
      } catch(e) {
        const buyerBalance = await bskt20Token.balanceOf.call(bskt20Buyer);
        assert.equal(buyerBalance.toNumber(), 0, 'should have no bskt token');
        for (let i = 0; i < tokenInstances.length; i++) {
          const buyerBalance = await tokenInstances[i].balanceOf(bskt20Buyer);
          const contractBalance = await tokenInstances[i].balanceOf(bskt20Token.address);
          assert.equal(buyerBalance.toNumber(), 200, 'should have the original token amount');
          assert.equal(contractBalance.toNumber(), 0, 'should have no underlying token');
        }
      }
    });

    context('Locked funds recovery', function () {

      // TODO: what happens if token address isn't an ERC20 and we try to cast?

      // Note that the bskt20Token owner also holds all the underlying tokens
      conditionalIt('should recover tokens sent to contract', async function test() {
        const token = tokenInstances[0];
        const ownerBalanceStart = await token.balanceOf(owner);

        await token.transfer(bskt20Token.address, 10);
        const ownerBalanceMid = await token.balanceOf(owner);
        await bskt20Token.withdrawExcessToken(token.address);

        const ownerBalanceEnd = await token.balanceOf(owner);

        assert.equal(ownerBalanceStart.toNumber() - ownerBalanceMid.toNumber(), 10);
        assert.equal(ownerBalanceEnd.toNumber() - ownerBalanceMid.toNumber(), 10);
        assert.equal(ownerBalanceStart.toNumber(), ownerBalanceEnd.toNumber());
      });

      conditionalIt('should not withdraw tokens for non-owner', async function test() {
        const token = tokenInstances[0];
        const buyer1BalanceStart = await token.balanceOf(buyer1);

        await token.transfer(bskt20Token.address, 10);
        try {
          const tx = await bskt20Token.withdrawExcessToken(token.address, {from: buyer1});
          assert.fail(false, true, 'contract address input should not be correct');
        } catch(e) {
          assertRevert(e);
        }

        const buyer1BalanceEnd = await token.balanceOf(buyer1);

        assert.equal(buyer1BalanceStart.toNumber(), buyer1BalanceEnd.toNumber());
      });

      conditionalIt('should recover exactly excess tokens sent to contract for bskt token', async () => {
        const token = tokenInstances[0];

        await bskt20Token.create(100, {from: bskt20Buyer});
        await token.transfer(bskt20Token.address, 1000);  // Excess tokens
        const bsktTokenBalanceWithExcess = await token.balanceOf(bskt20Token.address);
        await bskt20Token.withdrawExcessToken(token.address, {from: owner});
        const bsktTokenBalanceAfterWithdraw = await token.balanceOf(bskt20Token.address);

        assert.equal(bsktTokenBalanceWithExcess.toNumber() - bsktTokenBalanceAfterWithdraw.toNumber(), 1000);
        assert.equal(bsktTokenBalanceAfterWithdraw, 100 * tokenCountList[0]);
      });

      conditionalIt('should recover all excess tokens sent to contract for non-bskt token', async () => {
        const otherToken = await TokenB.new({from: buyer1});
        await bskt20Token.create(100, {from: bskt20Buyer});
        await otherToken.transfer(bskt20Token.address, 1000, {from: buyer1});  // Excess tokens
        await bskt20Token.withdrawExcessToken(otherToken.address);
        const ownerTokenBalance = await otherToken.balanceOf(owner);

        assert.equal(ownerTokenBalance, 1000);
      });

    });

    // TODO: initialization tests

    // TODO: realistic creationUnit test

  });

  context('With unique underlying tokens', function () {
    let bskt, tokenInstances, tokenCountList, tokenA, tokenB, tokenC;

    beforeEach(async function () {
      const tokenList = [TokenA, TokenB, TokenC];
      tokenCountList = [1, 2, 3];
      const result = await setupBsktToken(owner, buyer1, tokenList, tokenCountList, 1);
      bskt = result.bsktToken;
      [tokenA, tokenB, tokenC] = result.underlyingTokensInstance;
    });

    conditionalIt('should skip redeem for specified tokens', async function () {
      await bskt.create(10, {from: buyer1});
      await bskt.redeem(10, [tokenB.address, tokenC.address], {from: buyer1});

      let bsktTokenABalance = await tokenA.balanceOf(bskt.address);
      let bsktTokenBBalance = await tokenB.balanceOf(bskt.address);
      let bsktTokenCBalance = await tokenC.balanceOf(bskt.address);

      assert.equal(bsktTokenABalance.toNumber(), 0, 'contract TokenA balance should be 0');
      assert.equal(bsktTokenBBalance.toNumber(), 10 * tokenCountList[1], 'contract TokenB balance should not have been redeemed');
      assert.equal(bsktTokenCBalance.toNumber(), 10 * tokenCountList[2], 'contract TokenC balance should not have been redeemed');
    });

    conditionalIt('should skip redeem for specified tokens and owner withdraws them', async function () {
      let ownerTokenBBalanceStart = await tokenB.balanceOf(owner);
      let ownerTokenCBalanceStart = await tokenC.balanceOf(owner);

      await bskt.create(100, {from: buyer1});
      await bskt.redeem(100, [tokenB.address, tokenC.address], {from: buyer1});

      await bskt.withdrawExcessToken(tokenB.address, {from: owner});
      await bskt.withdrawExcessToken(tokenC.address, {from: owner});

      let bsktTokenBBalance = await tokenB.balanceOf(bskt.address);
      let bsktTokenCBalance = await tokenC.balanceOf(bskt.address);
      let ownerTokenBBalanceEnd = await tokenB.balanceOf(owner);
      let ownerTokenCBalanceEnd = await tokenC.balanceOf(owner);

      assert.equal(bsktTokenBBalance.toNumber(), 0, 'TokenB balance should be 0');
      assert.equal(bsktTokenCBalance.toNumber(), 0, 'TokenC balance should be 0');
      assert.equal(ownerTokenBBalanceEnd.toNumber() - ownerTokenBBalanceStart.toNumber(), 100 * tokenCountList[1], 'owner should have withdrawn the excess TokenBs');
      assert.equal(ownerTokenCBalanceEnd.toNumber() - ownerTokenCBalanceStart.toNumber(), 100 * tokenCountList[2], 'owner should have withdrawn the excess TokenCs');
    });

  });

  it('should not be able to initialize with more than 255', async function() {
    const tokenList = Array.from({length: 256}, () => TokenA);
    const tokenCountList = Array.from({length: 256}, () => 2);
    try {
      await BsktToken.new(tokenList, tokenCountList, 2, 'Basket', 'BSK');
      assert.fail(false, 'should not be able to deploy with more than 255 tokens');
    } catch(e) {
      // test may be failing because of gas before it fails because of length
      assert.isOk(e, 'some error');
    }
  });

});

/**-
 * Setup Bskt token with underlying token assets
 * @param owner: owner address
 * @param buyer: buyer address
 * @param underlyingTokens: token list
 * @param tokenCountList: list of count of each token in the bskt contract
 * @param creationUnit: creationUnit for bskt token
 * @return {bsktTokenInstance, [tokenInstance]}
 */
async function setupBsktToken(owner, buyer, underlyingTokens, tokenCountList, creationUnit) {
  const underlyingTokensPromise = underlyingTokens.map(token => token.new({from: owner}));
  const underlyingTokensInstance = await P.all(underlyingTokensPromise);

  const bsktToken = await BsktToken.new(
    underlyingTokensInstance.map(token => token.address),
    tokenCountList,
    creationUnit,
    'Basket',
    'BSK',
    {from: owner}
  );

  const CREATION_UNIT_MULTIPLE = NUM_UNITS / creationUnit;
  // Can't use await properly in a forEach loop
  for (let i = 0; i < underlyingTokensInstance.length; i++) {
    await underlyingTokensInstance[i].transfer(buyer, CREATION_UNIT_MULTIPLE * tokenCountList[i]);
    await underlyingTokensInstance[i].approve(
      bsktToken.address,
      CREATION_UNIT_MULTIPLE * tokenCountList[i],
      {from: buyer}
    );
  }

  return {
    bsktToken,
    underlyingTokensInstance
  };
}
