require('../scripts/compile');
const assert = require('assert');
const web3 = require('../web3/ganache');

const Main = require('../build/CryptoShapeMain_full.json');
const abi = Main['interface'];
const bytecode = Main['bytecode'];

let accts, contract, deployer;

beforeEach(async () => {
		// Get list of accts
		accts = await web3.eth.getAccounts();
		deployer = accts[0];

		// Use acct to deploy contract
		contract = await new web3.eth.Contract(JSON.parse(abi))
			.deploy({
				data: bytecode
			})
			.send({
				from: deployer,
				gas: '3000000'
			})

		contract.setProvider(web3.currentProvider);
});

describe("Main contract", () => {
	it("deploys properly", () => {
		assert.ok(contract.options.address);
	});

	it("stores the deployer as the manager field", async () => {
		const manager = await contract.methods.manager().call();
		assert.equal(manager, deployer);
	});
});
