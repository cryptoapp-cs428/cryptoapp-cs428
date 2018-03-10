require('dotenv').load();
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const mnemonic = process.env.DEPLOY_MNEMONIC
		|| 'various then junior outdoor prosper six column orchard soft town home machine';

const provider = new HDWalletProvider(
	mnemonic,
	'https://rinkeby.infura.io/6ez8Sc5cp5zniGCMP56R'
);

module.exports = new Web3(provider);
