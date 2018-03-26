require('../scripts/compile');
const assert = require('assert');
const web3 = require('../web3/ganache');

const Main = require('../build/CryptoShapeMain_full.json');
const abi = Main['interface'];
const bytecode = Main['bytecode'];

const shapeAbi = require('../facades/build_abis/CryptoShape_abi.json');

let accts,
	contract,
	deployer,
	user1,
	user2;

beforeEach(async function() {
		this.timeout(60000);
		// Get list of accts
		accts = await web3.eth.getAccounts();
		deployer = accts[0];
		web3.eth.defaultAccount = deployer;
		user1 = accts[1];
		user2 = accts[2];

		// Use acct to deploy contract
		contract = await new web3.eth.Contract(JSON.parse(abi))
			.deploy({
				data: bytecode
			})
			.send({
				from: deployer,
				gas: '6000000'
			})

		contract.setProvider(web3.currentProvider);
});

//======================================================================
//			Utility functions

function toWei(val, unit) {
	if (!unit) {
		[val, unit] = val.split(/\s+/);
	}
	return web3.utils.toWei(val, unit);
}

function deployShapeFrom(acct) {
	const prom = contract.methods.buyShape().send({
		from: acct,
		value: web3.utils.toWei('0.01', 'ether'),
		gas: '6000000'
	});
	// Return utility to get address of shape
	prom.andGetAddress = () => prom
		.then(() => contract.methods.getShapes().call({
			from: acct,
			gas: '6000000'
		}))
		.then(shapes => shapes[shapes.length - 1]);
	return prom;
}

function getContractForShape(addr) {
	return new web3.eth.Contract(shapeAbi, addr);
}

const identity = x => x;
const isChecksumAddress = a => web3.utils.isAddress(a) && web3.utils.checkAddressChecksum(a);
const assertEach = (arr, f=identity) => arr.map(f)
		.forEach((b, i) => assert(b, `el at ${i} failed assertion ${f.name || ''}`));

// Some constants, too
const randomFightCost = toWei('0.0001 ether');
const notEnoughForARandomFight = toWei('0.00005 ether');

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

	describe("buyShape()", () => {
		it("should produce a shape for the calling user", async () => {
			const shapeAddr = await deployShapeFrom(user1).andGetAddress();
			const shapeC = getContractForShape(shapeAddr);
			const owner = await shapeC.methods.owner().call();
			assert.equal(owner, user1);
		});
	});

	describe("getShapes()", () => {
		it("returns an empty list of shapes (initially)", async () => {
			const shapes = await contract.methods.getShapes().call();

			assert.deepEqual(shapes, []);
		});
		it("returns the list of shape addresses", async () => {
			const shapeAddr = await deployShapeFrom(user1).andGetAddress();

			const shapes = await contract.methods.getShapes().call();

			assert.equal(shapes.length, 1);
			assert(isChecksumAddress(shapes[0]));
			assert.equal(shapes[0], shapeAddr);
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

	describe("enterRandomFightPool()", () => {
		let shape1,
			shape2;
		beforeEach(async () => {
			shape1 = await deployShapeFrom(user1).andGetAddress();
			shape2 = await deployShapeFrom(user2).andGetAddress();
		});
		xit("should mark the shape as entered", async () => {
			await contract.methods.enterRandomFightPool(shape1).call({
				value: randomFightCost,
				from: user1,
			});
			const shape1C = getContractForShape(shape1);
			const entered = await shape1C.methods.awaitingRandomFight().call();
			assert(entered);
		});
		it("should require the user to be the shape owner", async () => {
			// Should fail:
			await contract.methods.enterRandomFightPool(shape1).call({
				value: randomFightCost,
				from: user2,
			}).then(assert.fail, assert.ok)
		});
		it("should require the user to pay at least [randomFightCost]", async () => {
			// Should fail:
			await contract.methods.enterRandomFightPool(shape1).call({
				value: notEnoughForARandomFight,
				from: user2,
			}).then(assert.fail, assert.ok);
		});
		it("should allow multiple users to enter the random pool", async () => {
			await Promise.all([
				contract.methods.enterRandomFightPool(shape1).call({
					value: randomFightCost,
					from: user1,
				}),
				contract.methods.enterRandomFightPool(shape2).call({
					value: randomFightCost,
					from: user2,
				})
			]);
		});
		xit("should not allow the same shape to enter twice", async () => {
			await contract.methods.enterRandomFightPool(shape1).call({
				value: randomFightCost,
				from: user1,
			});
			await contract.methods.enterRandomFightPool(shape1).call({
				value: randomFightCost,
				from: user1,
			}).then(
				() => assert.fail("Shape entered multiple times"),
				() => assert.ok("Shape was not allowed to enter multiple times")
			);
		});
	});
}).timeout(20000);
