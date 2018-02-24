require('dotenv').load();
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const mnemonic = process.env.DEPLOY_MNEMONIC;
if (!mnemonic) {
	throw new Error("You need to specify a DEPLOY_MNEMONIC string in your .env file");
}

const { abi, bytecode} = require('./build');


const provider = new HDWalletProvider(
	'various then junior outdoor prosper six column orchard soft town home machine',
	'https://rinkeby.infura.io/6ez8Sc5cp5zniGCMP56R'
);

const web3 = new Web3(provider);

(async function() {
	// Get list of accts
	const accts = await web3.eth.getAccounts();
	if (!accts) throw new Error("No accounts found!");
	const acct = accts[0];

	console.log("Deploying from ", acct);

	// Use acct to deploy contract
	const result = await new web3.eth.Contract(JSON.parse(abi))
		.deploy({
			data: bytecode,
		})
		.send({
			from: acct,
			gas: '1000000'
		})

	console.log("Deployed to ", result.options.address);

})().catch(console.error);
