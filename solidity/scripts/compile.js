const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');
const {
	contractsPath, buildPath, abisPath,
	removeBuildOutput
} = require('./_paths');

const lastBuildTime = getLastBuildTime(buildPath, abisPath);
console.log("Last Build Time:", lastBuildTime ? new Date(lastBuildTime) : "Never");

var files = fs.readdirSync(contractsPath);

const hasChanges = files
	.map(f => path.resolve(contractsPath, f))
	.map(p => fs.statSync(p).mtime > lastBuildTime)
	.reduce((a, b) => a || b);
if (hasChanges) {
	removeBuildOutput();
} else {
	console.log(`No changes made to contracts since last build`);
	// Quick-n-dirty way to skip compilation - empty the files array.
	files = [];
}

var contracts = {};
for (let file of files) {
	console.log(`Compiling ${file} ...`);
	const filePath = path.resolve(contractsPath, file);
	const src = fs.readFileSync(filePath, 'utf8');
	const output = solc.compile(src, 1);

	if (output.errors.length) {
		output.errors.forEach(err => console.error(err));
		if (!Object.keys(output.contracts).length) {
			console.error(`Could not compile ${file}`);
			process.exit(1);
		}
	}

	Object.assign(contracts, output.contracts);
}

const contractCount = Object.keys(contracts).length;
if (contractCount) {
	console.log(`Successfully compiled ${contractCount} contracts`);
} else {
	console.log('No contracts compiled');
}

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

function getLastBuildTime(...paths) {
	const times = paths
			.filter(path => fs.existsSync(path))
			.map(path => fs.statSync(path).mtime.getTime());
	if (times.length) {
		return times
			.reduce((a, b) => Math.min(a, b));
	} else {
		return 0;
	}
}
