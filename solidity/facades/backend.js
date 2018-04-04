const { address } = require('../deployed_main_contract.json');
const mainABI = require('./build_abis/CryptoShapeMain_abi.json');
const Shape = require('./shape');
const EventEmitter = require('eventemitter3');
const { Router }= require('express');

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

function _validateEvent(ev) {
	// TODO: validate event
	return true;
}

function _emitEvent(ev) {
	const values = ev.values || [];
	emitter.emit(_evTypeToKey(ev.type), ...values);
}

// Takes an event type (from the frontend) and converts it to theRightCaseForEventKeys
function _evTypeToKey(type) {
	// Make first char lowercase
	return type.substring(0,1).toLowerCase() + type.substring(1);
}

/**
 * Returns an Express Router that should be attached at the application root
 * with app.use(backendAPI.getEndpoint()).
 * @return {Express.Router} The router representing the solidty api endpoint
 */
function getEndpoint() {
	var router = Router();
	router.post('/validateEvent', function(req, res) {
		var valid = _validateEvent(req.body);

		if (valid) _emitEvent(req.body);

		res.status(valid ? 200 : 409) // 409: CONFLICT (client error)
			.json({ valid });
	});
	return router;
}

module.exports = {
	// Include Shape class for reference
	Shape,

	getEndpoint,

	async getAllShapes(){
		return [];
	},
	async resolveRandomMatch(shapeID1, shapeID2) {
		// Stub function, does nothing yet
	},
	on,
	useWeb3,

	// Exported for testing
	_evTypeToKey
};
