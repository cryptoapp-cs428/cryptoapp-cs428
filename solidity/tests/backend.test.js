require('../scripts/compile');
const assert = require('assert');
const backendFacade = require('../facades/backend');
const web3 = require('../web3/ganache');

const {
	setMainContract,
	deployShapeFrom,
} = require('./utils')(web3);

const Main = require('../build/CryptoShapeMain_full.json');
const abi = Main['interface'];
const bytecode = Main['bytecode'];

var mainContract,
	accts,
	deployer,
	user1,
	user2;
beforeEach(async function() {
	this.timeout(60000);
	// Get list of accts
	accts = await web3.eth.getAccounts();
	deployer = accts[0];
	user1 = accts[1];
	user2 = accts[2];
	// Use acct to deploy contract
	mainContract = await new web3.eth.Contract(JSON.parse(abi))
		.deploy({
			data: bytecode
		})
		.send({
			from: deployer,
			gas: '6000000'
		});
	setMainContract(mainContract);

	backendFacade.useWeb3(web3, mainContract.options.address);
});

//======================================================================
//			Test cases:

describe("Backend facade", () => {
	it("has a resolveRandomMatch function", () => {
		assert.equal(typeof backendFacade.resolveRandomMatch, 'function');
	});

	describe("getAllShapes", () => {
		beforeEach(async () => {
			await deployShapeFrom(user1);
			await deployShapeFrom(user2);
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

	describe("on()", () => {
		it("fires the right event when a ShapeAdded event is emitted", (done) => {
			var values = ["potato1", "bagel2"];

			backendFacade.on("shapeAdded", (...args) => {
				assert.deepEqual(args, values);
				done();
			});

			backendFacade._emitEvent({
				type: "ShapeAdded",
				values: values,
			});
		});
	});

	describe("private utilities", () => {
		describe("_evTypeToKey", () => {
			it("should lowercase the first letter", async () => {
				assert.equal(backendFacade._evTypeToKey("Potato"), "potato");
				assert.equal(backendFacade._evTypeToKey("PotatoEaten"), "potatoEaten");
			});
		});
	});
}).timeout(20000);
