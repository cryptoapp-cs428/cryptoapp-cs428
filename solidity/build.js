const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'AnimalBase.sol');
const src = fs.readFileSync(contractPath, 'utf8');

const contract = solc.compile(src, 1).contracts[':AnimalBase'];

module.exports = {
	bytecode: contract.bytecode,
	abi: contract.interface,
};
