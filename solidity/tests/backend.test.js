require('../scripts/compile');
const assert = require('assert');
const backendFacade = require('../facades/backend');
const web3 = require('../web3/ganache');

const Main = require('../build/CryptoShapeMain_full.json');
const abi = Main['interface'];
const bytecode = Main['bytecode'];

var mainContract,
	accts,
	deployer,
	user1;
beforeEach(async () => {
	// Get list of accts
	accts = await web3.eth.getAccounts();
	deployer = accts[0];
	user1 = accts[1];
	// Use acct to deploy contract
	mainContract = await new web3.eth.Contract(JSON.parse(abi))
		.deploy({
			data: bytecode
		})
		.send({
			from: deployer,
			gas: '6000000'
		})
	assert.ok(mainContract.options.address);

	backendFacade.useWeb3(require('../web3/rinkeby'), require('../web3/rinkeby-ws'), mainContract.options.address);
});

//======================================================================
//			Utility functions

function deployShapeFrom(acct) {
	const prom = mainContract.methods.buyShape().send({
		from: acct,
		value: web3.utils.toWei('0.01', 'ether'),
		gas: '6000000'
	});
	// Return utility to get address of shape
	prom.andGetAddress = () => prom
		.then(() => mainContract.methods.getShapes().call({
			from: acct
		}))
		.then(shapes => shapes[shapes.length - 1]);
	return prom;
}

//======================================================================
//			Test cases:

describe("Backend facade", () => {
	it("has a resolveRandomMatch function", () => {
		assert.equal(typeof backendFacade.resolveRandomMatch, 'function');
	});
	describe("getAllShapes", () => {
		it("is a function", () => {
			assert.equal(typeof backendFacade.getAllShapes, 'function');
		});
		it("returns a Promise for an array of Shapes", (done) => {
			backendFacade.getAllShapes().then(shapes => {
				assert(shapes instanceof Array);
				shapes.forEach(shape => {
					assert(shape instanceof backendFacade.Shape);
				});
			}).then(done);
		});
	});
	describe("events", () => {
		describe("shape added", () => {
			it.only("fires when a shape is purchased", async () => {
				var called = false;
				backendFacade.on("shapeAdded", () => called = true);

				await deployShapeFrom(user1);
				await new Promise(resolve => setTimeout(resolve, 200));

				assert(called);
			});
		});
	});
});
