/*
 * This file must use only ES5 syntax, because it's not run through Babel
 * before being minified by Webpack.
 */

const address = require('../deployed_main_contract.json').address;
const abi = require('./build_abis/CryptoShapeMain_abi.json');

module.exports = function(web3, addressOverride) {

	const mainContract = new web3.eth.Contract(abi, addressOverride || address);

	//======================================================================
	//			Public functions

	// Returns a promise for the default account, or the first account if no default is set
	function getUserAccount() {
		return web3.eth.defaultAccount
			? Promise.resolve(web3.eth.defaultAccount)
			:	web3.eth.getAccounts().then(function(accounts) {
				return accounts[0];
			});
	}

	// returns Promise<shapeAddress: String>
	function buyShape() {
		return getUserAccount().then(function(acct) {
			return mainContract.methods.buyShape().send({
				from: acct,
				value: web3.utils.toWei('0.01', 'ether'),
				gas: '6000000',
			});
		}).then(_validateAndReturn('ShapeAdded', 'shapeAddress'));
		// These two strings correspond to this line in Main.sol:
		//    event ShapeAdded(address shapeAddress, address owner);
	}

	//======================================================================
	//			Private functions

	/**
	 * Creates a function that takes a transaction result, validates the event of
	 * the given type, and then returns the value of the given parameter on that
	 * event (all asynchronously).
	 * @param       {String} eventName     The type of event to examine
	 * @param       {String} parameterName The name of the parameter to return
	 * @constructor
	 * @return      {Function(TransactionResult)}
	 */
	function _validateAndReturn(eventName, parameterName) {
		return function(result) {
			var ev = _getEvent(result, eventName);
			return _validateEvent(ev).then(function() {
				return ev.returnValues[parameterName];
			});
		};
	}

	function _getEvent(result, eventName) {
		// events[eventName] is sometimes an array, if there were multiple of that event. But there usually shouldn't be
		var count = result.events[eventName].length;
		if (count) {
			if (count > 1) {
				console.warn("There are " + count + " " + eventName + " events");
			}
			return result.events[eventName][0];
		} else {
			return result.events[eventName];
		}
	}

	function _validateEvent(ev) {
		return fetch("/validateEvent", {
			method: "POST",
			body: _eventToJson(ev),
		});
	}

	function _eventToJson(ev) {
		var values = [];
		var i = 0;
		while ( ev.returnValues[i] !== undefined ) {
			values[i] = ev.returnValues[i];
			i++;
		}
		return {
			type: ev.event,
			values: values,
		};
	}

	//======================================================================

	return {
		getUserAccount: getUserAccount,
		personalSign: function(message, fromAddress, callback) {
			// The web3.eth.sign method is broken for version 1.0.0 so
			// here we use a workaround
			var parms = [message, fromAddress];
			return web3.currentProvider.sendAsync({
				method: 'personal_sign',
				params: parms,
				from: fromAddress
			}, callback);
		},
		buyShape: buyShape,

		postRandom: stub,
		postChallenge: stub,
		acceptChallenge: stub,
		rejectChallenge: stub,

		// Exported for testing:
		_eventToJson: _eventToJson
	};

	function stub() {
		return Promise.resolve();
	}
};
