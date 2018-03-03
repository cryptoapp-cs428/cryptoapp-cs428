const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
module.exports = new Web3(provider);
