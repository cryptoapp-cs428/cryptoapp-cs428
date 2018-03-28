const { address } = require('../deployed_main_contract.json');
const mainABI = require('./build_abis/CryptoShapeMain_abi.json');
const mockData = require('./_mockData.json');
const Shape = require('./shape');

useWeb3(require('../web3/rinkeby'), require('../web3/rinkeby-ws'));

var web3, wsWeb3;
var mainContract, wsMainContract;

function useWeb3(newWeb3, newWsWeb3, addressOverride) {
	Shape.useWeb3(newWeb3);
	web3 = newWeb3;
	wsWeb3 = newWsWeb3;
	mainContract = new web3.eth.Contract(mainABI, addressOverride || address);
	wsMainContract = new wsWeb3.eth.Contract(mainABI, addressOverride || address);
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
			wsMainContract.events.ShapeAdded({ fromBlock: 0 }, function(error, result) {
				if (!error) {
					callback(result.args.shapeAddress, result.args.owner);
				} else {
					console.error("Error in shapeAdded event", error);
				}
			});
			break;
		case "challengePosted":
			wsMainContract.events.ChallengePosted({ fromBlock: 0 }, function(error, result) {
				if (!error) {
					callback(result.args.sourceShape, result.args.targetShape);
				} else {
					console.error("Error in challengePosted event", error);
				}
			});
			break;
		case "challengeResolved":
			wsMainContract.events.ChallengeResolved({ fromBlock: 0 }, function(error, result) {
				if (!error) {
					callback(result.args.sourceShape, result.args.targetShape, result.args.sourceWon);
				} else {
					console.error("Error in challengeResolved event", error);
				}
			});
			break;
		case "challengeRejected":
			wsMainContract.events.ChallengeRejected({ fromBlock: 0 }, function(error, result) {
				if (!error) {
					callback(result.args.sourceShape, result.args.targetShape);
				} else {
					console.error("Error in challengeRejected event", error);
				}
			});
			break;
		case "randomPosted":
			wsMainContract.events.RandomPosted({ fromBlock: 0 }, function(error, result) {
				if (!error) {
					callback(result.args.shapeAddress);
				} else {
					console.error("Error in randomPosted event", error);
				}
			});
			break;
		case "randomResolved":
			wsMainContract.events.RandomResolved({ fromBlock: 0 }, function(error, result) {
				if (!error) {
					callback(result.args.winnerShapeAddress, result.args.loserShapeAddress);
				} else {
					console.error("Error in randomResolved event", error);
				}
			});
			break;
		default:
			throw new Error("Unrecognized event type: " + eventKey);
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
