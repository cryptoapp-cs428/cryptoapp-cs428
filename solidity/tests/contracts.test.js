require('../scripts/compile');
const assert = require('assert');
const web3 = require('../web3/ganache');

const Main = require('../build/CryptoShapeMain_full.json');
const abi = Main['interface'];
const bytecode = Main['bytecode'];

let accts, contract, sendOpts;

beforeEach(async () => {
		// Get list of accts
		accts = await web3.eth.getAccounts();

		sendOpts = {
			from: accts[0],
			gas: '3000000'
		};

		// Use acct to deploy contract
		contract = await new web3.eth.Contract(JSON.parse(abi))
			.deploy({
				data: bytecode
			})
			.send(sendOpts)

		contract.setProvider(web3.currentProvider);
});

describe("Main contract", () => {
	it("deploys properly", () => {
		assert.ok(contract.options.address);
	});
});
