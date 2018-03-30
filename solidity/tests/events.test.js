require('../scripts/compile');
const assert = require('assert');
const backendFacade = require('../facades/backend');

const truffleContract = require('truffle-contract');

const web3 = require('../web3/ganache');
const wsWeb3 = require('../web3/ganache');

const Main = require('../build/CryptoShapeMain_full.json');
const abi = Main['interface'];
const bytecode = Main['bytecode'];

var mainContract,
	accts,
	deployer,
	user1;
before(async function() {
	this.timeout(60000);
	// Get list of accts
	accts = await web3.eth.getAccounts();
	deployer = accts[0];
	user1 = accts[1];
	console.log("Accounts obtained");

	// Use acct to deploy contract
	const provider = web3.currentProvider;
	assert.ok(provider, "web3.currentProvider is not ok");
	mainContract = await deployContract(JSON.parse(abi), bytecode, provider, deployer);
	assert.ok(mainContract);
	console.log("Main contract deployed");

	backendFacade.useWeb3(web3, wsWeb3, mainContract.address);
	console.log("backendFacade set up");
});

//======================================================================
//			Utility functions

function deployContract(abi, bytecode, provider, deployFrom) {
	var MainContract = truffleContract({
		abi: abi,
		unlinked_binary: bytecode,
	});
	MainContract.setProvider(provider);
	console.log("Deploying from ", deployFrom);
	return MainContract.new({
		from: deployFrom,
		gas: '6000000',
	});
}

function deployShapeFrom(acct) {
	const prom = mainContract.buyShape({
		from: acct,
		value: web3.utils.toWei('0.01', 'ether'),
		gas: '6000000'
	});
	// Return utility to get address of shape
	prom.andGetAddress = () => prom
		.then(() => mainContract.getShapes({
			from: acct
		}))
		.then(shapes => shapes[shapes.length - 1]);
	return prom;
}

//======================================================================
//			Test cases:

describe("events", () => {
	describe("utility methods", () => {
		describe("deployShapeFrom", () => {
			it("deploys a shape", async () => {
				var shapeAddress = await deployShapeFrom(user1).andGetAddress();

				assert(web3.utils.isAddress(shapeAddress));
			});
		});
	});

	describe("shape added", () => {
		xit("fires when a shape is purchased", async () => {
			var callback;
			var promise = new Promise(resolve => callback = resolve);

			backendFacade.on("shapeAdded", callback);
			await deployShapeFrom(user1).andGetAddress();

			await promise;
		});
	});
}).timeout(20000);
