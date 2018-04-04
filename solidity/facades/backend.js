const { address } = require('../deployed_main_contract.json');
const mainABI = require('./build_abis/CryptoShapeMain_abi.json');
const Shape = require('./shape');
const EventEmitter = require('eventemitter3');

useWeb3(require('../web3/rinkeby'));

var web3;
var mainContract;
var emitter = new EventEmitter();

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
	emitter.on(eventKey, callback);
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
