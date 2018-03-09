const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);
const abisPath = path.resolve(__dirname, 'facades', 'build_abis');
fs.removeSync(abisPath);

const contractPath = path.resolve(__dirname, 'contracts', 'AnimalBase.sol');
const src = fs.readFileSync(contractPath, 'utf8');

console.log("Compiling...");
const contracts = solc.compile(src, 1).contracts;

for (let name in contracts) {
	if (name.startsWith(':')) {
		// Output the full compilation result (bytecode, abi, etc.):
		fs.outputJsonSync(
			path.resolve(buildPath, name.substring(1) + "_full.json"),
			contracts[name]
		);
		// Output just the ABI, for the client
		fs.outputJsonSync(
			path.resolve(abisPath, name.substring(1) + "_abi.json"),
			JSON.parse(contracts[name]['interface']),
			{ spaces: '\t' }
		);
	}
}
