const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);
const abisPath = path.resolve(__dirname, 'facades', 'build_abis');
fs.removeSync(abisPath);

const contractsPath = path.resolve(__dirname, 'contracts');
const files = fs.readdirSync(contractsPath);

var contracts = {};
for (let file of files) {
	try {
		console.log(`Compiling ${file} ...`);
		const filePath = path.resolve(contractsPath, file);
		const src = fs.readFileSync(filePath, 'utf8');
		const fileContracts = solc.compile(src, 1).contracts;
		Object.assign(contracts, fileContracts);
		console.log(`Compiled ${file}`);
		console.log(Object.keys(fileContracts));
	} catch (err) {
		console.error(`Could not compile ${file}`, err);
	}
}

const contractCount = Object.keys(contracts).length;
console.log(`Successfully compiled ${contractCount} contracts`);
console.log(Object.keys(contracts));

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
