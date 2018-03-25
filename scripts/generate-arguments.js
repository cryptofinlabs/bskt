// Script to generate constructor argument list from config files to speed up development with Remix.
const path = require('path');

if (require.main === module) {
  let configFile;
  process.argv.forEach(function (val, index) {
    if (val == '--network') {
      network = process.argv[index + 1];
    }
    if (val == '--config') {
      configFile = process.argv[index + 1];
      configFile = path.resolve(configFile);
    }
  });
  config = require(configFile);
  let arglist = '';
  arglist += '[';
  arglist += config[network].tokenAddresses.map(function(e) {
    return '"' + e + '"';
  })
  arglist += '],[';
  arglist += config[network].tokenQuantities.map(function(e) {
    return '"' + e + '"';
  })
  arglist += '],';
  arglist += '"' + config[network].creationUnit + '"';
  arglist += ',';
  arglist += '"' + config[network].name + '"';
  arglist += ',';
  arglist += '"' + config[network].symbol + '"';

  console.log(arglist);
}
