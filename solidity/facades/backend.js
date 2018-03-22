const { address } = require('../deployed_main_contract.json');
const mainABI = require('../build/CryptoShape_full.json');
const mockData = require('./_mockData.json');
const Shape = require('./shape');

var web3 = null;
var mainContract;
var eventShapeAdded, eventChallengePosted, eventChallengeResolved, eventChallengeRejected, eventRandomPosted, eventRandomResolved;
function useWeb3(newWeb3) {
	Shape.useWeb3(newWeb3);
	web3 = newWeb3;
	var MainContract = web3.eth.contract(abi);
	mainContract = MainContract.at(address);
	getEvents();
}

function getEvents() {
	eventShapeAdded = mainContract.ShapeAdded({}, {fromBlock: 0, toBlock: 'latest'});
	eventChallengePosted = mainContract.ChallengePosted({}, {fromBlock: 0, toBlock: 'latest'});
	eventChallengeResolved = mainContract.ChallengeResolved({}, {fromBlock: 0, toBlock: 'latest'});
	eventChallengeRejected = mainContract.ChallengeRejected({}, {fromBlock: 0, toBlock: 'latest'});
	eventRandomPosted = mainContract.RandomPosted({}, {fromBlock: 0, toBlock: 'latest'});
	eventRandomResolved = mainContract.RandomResolved({}, {fromBlock: 0, toBlock: 'latest'});
}

const shapes = mockData.shapes.map(Shape.fromJSON);

/* Do something like this to make the backend Shape API (from app.js)
async function shapeContractData(address) {
    let shapeData = {address: address};
    let colorInt;

    const shapeContract = await new solidityAPI.useWeb3.eth.Contract(shapeInterface, address);

    // See https://medium.com/@bluepnume/learn-about-promises-before-you-start-using-async-await-eb148164a9c8
    // These need to line up from top to bottom!
    [
        shapeData.owner,
        shapeData.level,
        shapeData.experience,
        shapeData.seekingRandom,
        colorInt
    ] = await Promise.all([
        shapeContract.methods.owner().call(),
        shapeContract.methods.level().call(),
        shapeContract.methods.experience().call(),
        shapeContract.methods.awaitingRandomFight().call(),
        shapeContract.methods.rgbColor().call()
    ]);

    shapeData.color = colorInt.toString(16);

    return shapeData;
}
*/

/* on(eventKey, callback) Example usage:
	solidityAPI.on("shapeAdded", function(shapeAddress, ownerAddress) {
		// Called by the API whenever a shape is added.
	})

"shapeAdded"        has args (shapeAddress, owner);
"challengePosted"   has args (sourceShape, targetShape);
"challengeResolved" has args (sourceShape, targetShape, sourceWon);
"challengeRejected" has args (sourceShape, targetShape);
"randomPosted"      has args (shapeAddress);
"randomResolved"    has args (winnerShapeAddress, loserShapeAddress);
*/
function on(eventKey, callback) {
	switch (eventKey) {
		case "shapeAdded":
			eventShapeAdded.watch(function(error, result) {
				if (!error) {
					callback(result.args.shapeAddress, result.args.owner);
				}
			});
			break;
		case "challengePosted":
			eventChallengePosted.watch(function(error, result) {
				if (!error) {
					callback(result.args.sourceShape, result.args.targetShape);
				}
			});
			break;
		case "challengeResolved":
			eventChallengeResolved.watch(function(error, result) {
				if (!error) {
					callback(result.args.sourceShape, result.args.targetShape, result.args.sourceWon);
				}
			});
			break;
		case "challengeRejected":
			eventChallengeRejected.watch(function(error, result) {
				if (!error) {
					callback(result.args.sourceShape, result.args.targetShape);
				}
			});
			break;
		case "randomPosted":
			eventRandomPosted.watch(function(error, result) {
				if (!error) {
					callback(result.args.shapeAddress);
				}
			});
			break;
		case "randomResolved":
			eventRandomResolved.watch(function(error, result) {
				if (!error) {
					callback(result.args.winnerShapeAddress, result.args.loserShapeAddress);
				}
			});
			break;
		default:
			break;
	}
}

module.exports = {
	// Include Shape class for reference
	Shape,

	async getAllShapes(){
		return shapes;
	},
	async resolveRandomMatch(shapeID1, shapeID2) {
		// Stub function, does nothing yet
	},
	on,
	useWeb3,
};
