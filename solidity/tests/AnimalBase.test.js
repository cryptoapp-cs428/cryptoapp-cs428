const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const { abi, bytecode } = require('../build');

const provider = ganache.provider();
const web3 = new Web3(provider);

describe("AnimalBase", () => {
	let accts, contract, sendOpts;

	beforeEach(async () => {
		// Get list of accts
		accts = await web3.eth.getAccounts();

		sendOpts = {
			from: accts[0],
			gas: '1000000'
		};

		// Use acct to deploy contract
		contract = await new web3.eth.Contract(JSON.parse(abi))
			.deploy({
				data: bytecode
			})
			.send(sendOpts)

		contract.setProvider(provider);
	})

	it("deploys a contract", () => {
		assert.ok(contract);
		assert.ok(contract.options.address);
	});
});
