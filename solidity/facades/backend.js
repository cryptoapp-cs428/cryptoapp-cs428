const { address } = require('../deployed_main_contract.json');
const mainABI = require('./build_abis/CryptoShapeMain_abi.json');
const mockData = require('./_mockData.json');
const Shape = require('./shape');

useWeb3(require('../web3/rinkeby'), require('../web3/rinkeby-ws'));

var web3, wsWeb3;
var mainContract;
var eventShapeAdded, eventChallengePosted, eventChallengeResolved, eventChallengeRejected, eventRandomPosted, eventRandomResolved;

function useWeb3(newWeb3, newWsWeb3) {
	Shape.useWeb3(newWeb3);
	web3 = newWeb3;
	wsWeb3 = newWsWeb3;
	mainContract = new web3.eth.Contract(mainABI, address);
	// mainContract = MainContract.at(address);
	getEvents();
}

function getEvents() {
	const wsMainContract = new wsWeb3.eth.Contract(mainABI, address);
	eventShapeAdded = wsMainContract.events.ShapeAdded({}, {fromBlock: 0, toBlock: 'latest'});
	eventChallengePosted = wsMainContract.events.ChallengePosted({}, {fromBlock: 0, toBlock: 'latest'});
	eventChallengeResolved = wsMainContract.events.ChallengeResolved({}, {fromBlock: 0, toBlock: 'latest'});
	eventChallengeRejected = wsMainContract.events.ChallengeRejected({}, {fromBlock: 0, toBlock: 'latest'});
	eventRandomPosted = wsMainContract.events.RandomPosted({}, {fromBlock: 0, toBlock: 'latest'});
	eventRandomResolved = wsMainContract.events.RandomResolved({}, {fromBlock: 0, toBlock: 'latest'});
}

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
		return [];
	},
	async resolveRandomMatch(shapeID1, shapeID2) {
		// Stub function, does nothing yet
	},
	on,
	useWeb3,
};
