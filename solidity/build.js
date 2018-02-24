const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'AnimalBase.sol');
const src = fs.readFileSync(contractPath, 'utf8');

const out = solc.compile(src, 1);

module.exports = out.contracts[':AnimalBase'];
