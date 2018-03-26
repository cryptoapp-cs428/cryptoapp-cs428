const path = require('path');
const fs = require('fs-extra');

const contractsPath = path.resolve(__dirname, '..', 'contracts');
const buildPath = path.resolve(__dirname, '..', 'build');
const abisPath = path.resolve(__dirname, '..', 'facades', 'build_abis');

module.exports = {
	contractsPath,
	buildPath,
	abisPath,

	removeBuildOutput() {
		[buildPath, abisPath]
			.filter(path => fs.existsSync(path))
			.forEach(path => fs.removeSync(path));
	}
};
