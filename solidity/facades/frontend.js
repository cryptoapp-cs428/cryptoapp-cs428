/*
 * This file must use only ES5 syntax, because it's not run through Babel
 * before being minified by Webpack.
 */

const address = require('../deployed_main_contract.json').address;
const abi = require('./build_abis/Main_abi.json');

module.exports = function(web3) {

	const mainContract = new web3.eth.Contract(abi, address);

	return {
		// Returns a promise for the default account, or the first account if no default is set
		getUserAccount: function() {
			return web3.eth.defaultAccount
				? Promise.resolve(web3.eth.defaultAccount)
				:	web3.eth.getAccounts().then(function(accounts) {
					return accounts[0];
				});
		},
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
		getAnimalCount: function() {
			return Promise.resolve(0);
		},
		animalIndexToOwner: function() {
			return Promise.resolve(null);
		},
		getUserAnimals: function() {
			return Promise.resolve([]);
		},
	};
}
