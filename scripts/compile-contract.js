/**
 * How it works: npm run test:e2e
    - The test will pull the latest master of the "underlying-token-contracts" repo
    - It will compile all the tokens and add to build/contracts
    - It will look up what args are used for each contract and use them deploy the token contract to local ganache
    - The test will then initialize the Bskt token with each of the underlying tokens
 */

const P = require('bluebird');
const fs = require('fs');
const solc = require('solc');
const glob = require('glob');
const mkdirp = require('mkdirp');
const checksum = require('checksum');
const jsonfile = require('jsonfile');
const colors = require('colors');
const Artifactor = require('truffle-artifactor');

const checksumLocation = './temp/underlying-token-contracts/checksum.json';
const mkdirpPromise = P.promisify(mkdirp);

let checksumStore;

glob("**/underlying-token-contracts/*/*.sol", {}, async function (er, files) {
  if (!files.length) {
    console.log('Cannot find any underlying token contract files, make sure the submodule is imported');
    process.exit(1);
  }
  if (!fs.existsSync(checksumLocation)){
    await mkdirpPromise('./temp/underlying-token-contracts');
    jsonfile.writeFileSync(checksumLocation, {}, {spaces: 2});
  }

  checksumStore = require(`../${checksumLocation}`);

  for (let i=0; i<files.length; i++) {
    const toCompile = await shouldCompile(files[i]);
    if (toCompile) {
      console.log(`Compiling ${files[i]}`);
      await compile(files[i]);
    }
  }
});

async function compile(fileLocation) {
  const contractName = fileLocation.split('/').pop().split('.').shift();
  // if (fs.existsSync(`./build/contracts/${contractName}.json`)){
  //   return contractName;
  // }

  const source = fs.readFileSync(fileLocation, {encoding: 'utf8'}).toString();

  const compiled = solc.compile(source, 1);
  if (!Object.keys(compiled.contracts).length) {
    console.log(`${fileLocation} failed to compile!`.red);
  }
  const contract = compiled.contracts[`:${contractName}`];
  if(!contract) {
    console.log('Contract must have same name as file!');
    process.exit(1);
  }
  const bytecode = contract.bytecode;
  const interface = contract.interface;

  const contractData = {
    contract_name: contractName,
    abi: JSON.parse(interface),
    binary: bytecode
  };

  const destinationFolder = './build/contracts';
  if (!fs.existsSync(destinationFolder)){
    await mkdirpPromise(destinationFolder);
  }
  const artifactor = new Artifactor(destinationFolder);

  await artifactor.save(contractData);
  console.log(`File ${destinationFolder}/${contractName}.json was created with the JS contract!`);

  return contractName;
}

async function shouldCompile(fileLocation) {
  const checksumPromise = P.promisify(checksum.file);
  const sum = await checksumPromise(fileLocation);
  if (checksumStore[fileLocation] === sum) {
    return false;
  }
  checksumStore[fileLocation] = sum;
  jsonfile.writeFileSync('./temp/underlying-token-contracts/checksum.json', checksumStore, {spaces: 2});
  return true;
}
