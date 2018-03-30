require('../scripts/compile');
const assert = require('assert');
const web3 = require('../web3/ganache');

const frontendAPIFactory = require('../facades/frontend');

const Main = require('../build/CryptoShapeMain_full.json');
const abi = Main['interface'];
const bytecode = Main['bytecode'];

var accts, mainContract, frontendAPI;

beforeEach(async () => {
		// Get list of accts
		accts = await web3.eth.getAccounts();

		var sendOpts = {
			from: accts[0],
			gas: '3000000'
		};

		// Use acct to deploy mainContract
		mainContract = await new web3.eth.Contract(JSON.parse(abi))
			.deploy({
				data: bytecode
			})
			.send(sendOpts);

		// Deploy two shapes
		await deployShapeFrom(accts[1]);
		await deployShapeFrom(accts[2]);

		frontendAPI = frontendAPIFactory(web3, mainContract.options.address);
});

describe("Frontend Solidity API", () => {
	describe("getShapeCount()", () => {
		it("should return the number of shapes in the blockchain", async () => {
			const count = await frontendAPI.getShapeCount();
			assert.equal(count, 2);
		});
	});

	describe("personalSign(...)", () => {
		it("should... do something...", done => {
			frontendAPI.personalSign("Potato", accts[1], function(err, data) {
				// personal_sign isn't actually supported by ganace, so this is the best we can do.
				done();
			});
		});
	});
});

//======================================================================
//			Utility functions

function deployShapeFrom(acct) {
	return mainContract.methods.buyShape().send({
		from: acct,
		value: web3.utils.toWei('0.01', 'ether'),
		gas: '3000000'
	});
}
