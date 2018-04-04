/*
 * A generic web3 utility module for use in unit tests, etc.
 */

var contract = null;
var shapeAbi = require('../facades/build_abis/CryptoShape_abi.json');
var assert = require('assert');

module.exports = function(web3) {
	function setMainContract(mc) {
		contract = mc;
	}

	function toWei(val, unit) {
		if (!unit) {
			[val, unit] = val.split(/\s+/);
		}
		return web3.utils.toWei(val, unit);
	}

	function deployShapeFrom(acct) {
		assert.ok(acct);
		const prom = contract.methods.buyShape().send({
			from: acct,
			value: web3.utils.toWei('0.01', 'ether'),
			gas: '3000000'
		});
		// Return utility to get address of shape
		prom.andGetAddress = () => prom
		.then(result => result.events['ShapeAdded'].returnValues.shapeAddress);
		return prom;
	}

	function getContractForShape(addr) {
		return new web3.eth.Contract(shapeAbi, addr);
	}

	const identity = x => x;
	const isChecksumAddress = a => web3.utils.isAddress(a) && web3.utils.checkAddressChecksum(a);
	const assertEach = (arr, f=identity) => arr.map(f)
	.forEach((b, i) => assert(b, `el at ${i} failed assertion ${f.name || ''}`));

	// Some constants, too
	const RANDOM_FIGHT_COST = toWei('0.0001 ether');
	const NOT_ENOUGH_FOR_RANDOM_FIGHT = toWei('0.00005 ether');

	return {
		setMainContract,

		deployShapeFrom,
		getContractForShape,

		toWei,
		isChecksumAddress,
		assertEach,

		RANDOM_FIGHT_COST,
		NOT_ENOUGH_FOR_RANDOM_FIGHT,
	};

};
