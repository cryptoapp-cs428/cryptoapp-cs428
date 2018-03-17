const { address } = require('../deployed_main_contract.json');
const mainABI = require('./build_abis/Main_abi.json');
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
	switch eventKey {
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
