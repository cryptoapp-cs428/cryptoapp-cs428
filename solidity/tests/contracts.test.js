require('../scripts/compile');
const assert = require('assert');
const web3 = require('../web3/ganache');

const Main = require('../build/CryptoShapeMain_full.json');
const abi = Main['interface'];
const bytecode = Main['bytecode'];

let accts,
	contract,
	deployer,
	user1,
	user2;

beforeEach(async () => {
		// Get list of accts
		accts = await web3.eth.getAccounts();
		deployer = accts[0];
		user1 = accts[1];
		user2 = accts[2];

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

//======================================================================
//			Utility functions

function deployShapeFrom(acct) {
	return contract.methods.buyShape().send({
		from: acct,
		value: web3.utils.toWei('0.01', 'ether'),
		gas: '3000000'
	});
}

const identity = x => x;
const isChecksumAddress = a => web3.utils.isAddress(a) && web3.utils.checkAddressChecksum(a);
const assertEach = (arr, f=identity) => arr.map(f)
		.forEach((b, i) => assert(b, `el at ${i} failed assertion ${f.name || ''}`));

//======================================================================
//			Test cases

describe("Main contract", () => {
	it("deploys properly", () => {
		assert.ok(contract.options.address);
	});

	it("stores the deployer as the manager field", async () => {
		const manager = await contract.methods.manager().call();

		assert.equal(manager, deployer);
	});

	describe("getShapes()", () => {
		it("returns an empty list of shapes (initially)", async () => {
			const shapes = await contract.methods.getShapes().call();

			assert.deepEqual(shapes, []);
		});
		it("returns a list of shape addresses", async () => {
			await deployShapeFrom(user1);

			const shapes = await contract.methods.getShapes().call();

			assert.equal(shapes.length, 1);
			assert(isChecksumAddress(shapes[0]));
		});
		it("can return multiple addresses", async () => {
			await deployShapeFrom(user1);
			await deployShapeFrom(user1);
			await deployShapeFrom(user2);

			const shapes = await contract.methods.getShapes().call();

			assert.equal(shapes.length, 3);
			assertEach(shapes, isChecksumAddress);
		});
	});
});
