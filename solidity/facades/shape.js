const shapeAbi = require('./build_abis/CryptoShape_abi.json');

class Shape {
	constructor(address) {
		this.id = address;
		this.contractPromise = _getContractAt(address);
	}

	toJSON() {
		return {
			id: this.id,
			// TODO: what else?
		}
	}
}

// A utility method for inflating Shape objects from JSON representation
Shape.fromJSON = function(json) {
	const shape = new Shape(json.address);
	// TODO: what else?
	return shape;
};
Shape.address = function() {
	return this.id;
};
Shape.owner = async function() {
	return await this.contractPromise.methods.owner().call();
};
Shape.level = async function() {
	return await this.contractPromise.methods.level().call();
};
Shape.experience = async function() {
	return await this.contractPromise.methods.experience().call();
};
Shape.awaitingRandomFight = async function() {
	return await this.contractPromise.methods.awaitingRandomFight().call();
};
Shape.rgbColor = async function() {
	return await this.contractPromise.methods.rgbColor().call();
};

// Makes a Shape.useWeb3 function that should be passed the web3 instance to use
const web3promise = new Promise(resolve => Shape.useWeb3 = resolve);

// Returns a promise for a web3 Contract pointed to the given address
function _getContractAt(address) {
	return web3promise
		.then(web3 => new web3.eth.Contract(shapeAbi, address));
}

module.exports = Shape;
