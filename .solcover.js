module.exports = {
  accounts: 10,
  norpc: true,
  testCommand: "truffle test --network coverage ./test/BsktToken.test.js",
  copyPackages: ["zeppelin-solidity"],
  skipFiles: ["Migrations.sol", "TokenA.sol", "TokenB.sol", "TokenC.sol", "MultiSigWallet.sol"]
};
