const HDWalletProvider = require('truffle-hdwallet-provider');

const secrets = require('./config/secrets.json')

const mochaGasSettings = {
  reporter: 'eth-gas-reporter',
  reporterOptions : {
    currency: 'USD',
    gasPrice: 21
  }
};

const mocha = process.env.GAS_REPORTER ? mochaGasSettings : {};

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '5777'
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(secrets.mnemonic, `https://ropsten.infura.io/${secrets.infura_token}`)
      },
      network_id: 3,
      gasPrice: 9,
      gas: 4000000,
      from: '0x8bbe02653aac65ed51bed07dc3f23136d6de7b2c'
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(secrets.mnemonic, `https://rinkeby.infura.io/${secrets.infura_token}`)
      },
      network_id: 4
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(secrets.mnemonic, `https://mainnet.infura.io/${secrets.infura_token}`)
      },
      network_id: 1,
      gasPrice: 4000000000,
      gas: 4000000,
      from: '0x8bbe02653aac65ed51bed07dc3f23136d6de7b2c'
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8555,
      gas: 0xffffffffff,
      gasPrice: 0x01
    },
  },
  mocha
};
