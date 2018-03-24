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
		const output = solc.compile(src, 1);
		if (output.errors.length) {
			output.errors.forEach(err => console.error(err));
			if (!Object.keys(output.contracts).length) {
				console.error("No contracts were successfully compiled");
				process.exit(1);
			}
		}
		Object.assign(contracts, output.contracts);
	} catch (err) {
		console.error(`Could not compile ${file}`, err);
	}
}

const contractCount = Object.keys(contracts).length;
console.log(`Successfully compiled ${contractCount} contracts`);

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
