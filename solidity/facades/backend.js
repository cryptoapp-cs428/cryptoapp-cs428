const { address } = require('../deployed_main_contract.json');
const mainABI = require('./build_abis/CryptoShapeMain_abi.json');
const Shape = require('./shape');

useWeb3(require('../web3/rinkeby'));

var web3;
var mainContract;

function useWeb3(newWeb3, addressOverride) {
	Shape.useWeb3(newWeb3);
	web3 = newWeb3;
	mainContract = new web3.eth.Contract(mainABI, addressOverride || address);
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
			// TODO
			break;
		case "challengePosted":
			// TODO
			break;
		case "challengeResolved":
			// TODO
			break;
		case "challengeRejected":
			// TODO
			break;
		case "randomPosted":
			// TODO
			break;
		case "randomResolved":
			// TODO
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
