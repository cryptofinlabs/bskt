var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network) {
  if (network == "development") {
    deployer.deploy(Migrations);
  }
};
