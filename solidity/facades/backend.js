const { address } = require('../deployed_main_contract.json');
const mainABI = require('./build_abis/CryptoShapeMain_abi.json');
const mockData = require('./_mockData.json');
const Shape = require('./shape');

var web3 = null;
var mainContract;
var eventShapeAdded, eventChallengePosted, eventChallengeResolved, eventChallengeRejected, eventRandomPosted, eventRandomResolved;

// This must be called before the API is used!
function useWeb3(newWeb3) {
	Shape.useWeb3(newWeb3);
	web3 = newWeb3;
	mainContract = new web3.eth.Contract(mainABI, address);
	// mainContract = MainContract.at(address);
	getEvents();
}

function getEvents() {
	eventShapeAdded = mainContract.events.ShapeAdded({}, {fromBlock: 0, toBlock: 'latest'});
	eventChallengePosted = mainContract.events.ChallengePosted({}, {fromBlock: 0, toBlock: 'latest'});
	eventChallengeResolved = mainContract.events.ChallengeResolved({}, {fromBlock: 0, toBlock: 'latest'});
	eventChallengeRejected = mainContract.events.ChallengeRejected({}, {fromBlock: 0, toBlock: 'latest'});
	eventRandomPosted = mainContract.events.RandomPosted({}, {fromBlock: 0, toBlock: 'latest'});
	eventRandomResolved = mainContract.events.RandomResolved({}, {fromBlock: 0, toBlock: 'latest'});
}

const shapes = mockData.shapes.map(Shape.fromJSON);

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
			eventShapeAdded.on('data', function(error, result) {
				if (!error) {
					callback(result.args.shapeAddress, result.args.owner);
				}
			});
			break;
		case "challengePosted":
			eventChallengePosted.on('data', function(error, result) {
				if (!error) {
					callback(result.args.sourceShape, result.args.targetShape);
				}
			});
			break;
		case "challengeResolved":
			eventChallengeResolved.on('data', function(error, result) {
				if (!error) {
					callback(result.args.sourceShape, result.args.targetShape, result.args.sourceWon);
				}
			});
			break;
		case "challengeRejected":
			eventChallengeRejected.on('data', function(error, result) {
				if (!error) {
					callback(result.args.sourceShape, result.args.targetShape);
				}
			});
			break;
		case "randomPosted":
			eventRandomPosted.on('data', function(error, result) {
				if (!error) {
					callback(result.args.shapeAddress);
				}
			});
			break;
		case "randomResolved":
			eventRandomResolved.on('data', function(error, result) {
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
