require('../scripts/compile');
const assert = require('assert');
const web3 = require('../web3/ganache');

const frontendAPIFactory = require('../facades/frontend');

const Main = require('../build/CryptoShapeMain_full.json');
const abi = Main['interface'];
const bytecode = Main['bytecode'];

var frontendAPI;

beforeEach(async () => {
		// Get list of accts
		var accts = await web3.eth.getAccounts();

		var sendOpts = {
			from: accts[0],
			gas: '3000000'
		};

		// Use acct to deploy contract
		var contract = await new web3.eth.Contract(JSON.parse(abi))
			.deploy({
				data: bytecode
			})
			.send(sendOpts)

		// Deploy two shapes

		await contract.methods.buyShape().send({
			from: accts[1],
			value: web3.utils.toWei('0.01', 'ether'),
			gas: '3000000'
		});

		await contract.methods.buyShape().send({
			from: accts[2],
			value: web3.utils.toWei('0.01', 'ether'),
			gas: '3000000'
		});

		frontendAPI = frontendAPIFactory(web3, contract.options.address);
});

describe("Frontend Solidity API", () => {
	it("should return the number of shapes in the blockchain", async () => {
		const count = await frontendAPI.getShapeCount();
		assert.equal(count, 2);
	});
});
